-- ════════════════════════════════════════════════════════════════
-- 0002_functions_triggers.sql
-- ════════════════════════════════════════════════════════════════

-- updated_at helper
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_updated  before update on profiles  for each row execute function set_updated_at();
create trigger trg_products_updated  before update on products  for each row execute function set_updated_at();
create trigger trg_orders_updated    before update on orders    for each row execute function set_updated_at();

-- ── New auth user → profile row ────────────────────────────────
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Role helpers (used by RLS; security definer avoids recursion)
create or replace function is_staff() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','manager')
  );
$$;

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- promote first admin from SQL editor:  select promote_to_admin('you@mail.mn');
create or replace function promote_to_admin(user_email text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update profiles set role = 'admin' where email = user_email;
end $$;

-- ── Category materialized path (unlimited depth) ───────────────
create or replace function maintain_category_path() returns trigger
language plpgsql as $$
declare parent_path text; parent_depth int;
begin
  if new.parent_id is null then
    new.path := new.slug; new.depth := 0;
  else
    select path, depth into parent_path, parent_depth from categories where id = new.parent_id;
    if parent_path is null then raise exception 'Parent category not found'; end if;
    new.path := parent_path || '/' || new.slug;
    new.depth := parent_depth + 1;
  end if;
  return new;
end $$;

create trigger trg_category_path
  before insert or update of parent_id, slug on categories
  for each row execute function maintain_category_path();

-- cascade path changes to descendants
create or replace function cascade_category_path() returns trigger
language plpgsql as $$
begin
  if (old.path is distinct from new.path) then
    update categories c
       set path = new.path || substring(c.path from length(old.path) + 1),
           depth = c.depth + (new.depth - old.depth)
     where c.path like old.path || '/%';
  end if;
  return null;
end $$;

create trigger trg_category_path_cascade
  after update of path on categories
  for each row execute function cascade_category_path();

-- ── Product search vector ('simple' config — Mongolian Cyrillic)
create or replace function products_search_trigger() returns trigger
language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.sku, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'C');
  return new;
end $$;

create trigger trg_products_search
  before insert or update of name, sku, description on products
  for each row execute function products_search_trigger();

-- ── Ratings roll-up on review approval/change ──────────────────
create or replace function refresh_product_rating() returns trigger
language plpgsql as $$
declare pid uuid := coalesce(new.product_id, old.product_id);
begin
  update products p set
    rating_avg   = coalesce((select round(avg(rating)::numeric, 1) from reviews where product_id = pid and is_approved), 0),
    rating_count = (select count(*) from reviews where product_id = pid and is_approved)
  where p.id = pid;
  return null;
end $$;

create trigger trg_review_rating
  after insert or update or delete on reviews
  for each row execute function refresh_product_rating();

-- ── Order number: TB-2026-00001 ────────────────────────────────
create or replace function assign_order_number() returns trigger
language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'TB-' || to_char(now(), 'YYYY') || '-' ||
                        lpad(nextval('order_number_seq')::text, 5, '0');
  end if;
  return new;
end $$;

create trigger trg_order_number
  before insert on orders
  for each row execute function assign_order_number();

-- ── Transactional stock reserve / commit / release ─────────────
-- Called from checkout Server Action (Module 4). Locks rows, prevents
-- overselling, writes the stock_movements audit trail.
create or replace function reserve_stock(p_order_id uuid, p_warehouse_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare item record; avail int;
begin
  for item in
    select variant_id, quantity, product_name from order_items where order_id = p_order_id
  loop
    select quantity - reserved into avail
      from inventory_levels
     where variant_id = item.variant_id and warehouse_id = p_warehouse_id
     for update;

    if avail is null or avail < item.quantity then
      raise exception 'INSUFFICIENT_STOCK:%', item.product_name;
    end if;

    update inventory_levels
       set reserved = reserved + item.quantity, updated_at = now()
     where variant_id = item.variant_id and warehouse_id = p_warehouse_id;
  end loop;
end $$;

-- on payment confirmed: reserved → sold
create or replace function commit_stock(p_order_id uuid, p_warehouse_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare item record;
begin
  for item in select variant_id, quantity from order_items where order_id = p_order_id
  loop
    update inventory_levels
       set quantity = quantity - item.quantity,
           reserved = greatest(reserved - item.quantity, 0),
           updated_at = now()
     where variant_id = item.variant_id and warehouse_id = p_warehouse_id;

    insert into stock_movements (variant_id, warehouse_id, type, quantity, reference_id)
    values (item.variant_id, p_warehouse_id, 'sale', -item.quantity, p_order_id);
  end loop;

  update products p set sold_count = sold_count + s.qty
  from (select oi.variant_id, oi.quantity as qty, pv.product_id
          from order_items oi join product_variants pv on pv.id = oi.variant_id
         where oi.order_id = p_order_id) s
  where p.id = s.product_id;
end $$;

-- on cancellation / payment timeout
create or replace function release_stock(p_order_id uuid, p_warehouse_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare item record;
begin
  for item in select variant_id, quantity from order_items where order_id = p_order_id
  loop
    update inventory_levels
       set reserved = greatest(reserved - item.quantity, 0), updated_at = now()
     where variant_id = item.variant_id and warehouse_id = p_warehouse_id;
  end loop;
end $$;

-- ── Loyalty balance follows transactions ───────────────────────
create or replace function apply_loyalty_tx() returns trigger
language plpgsql as $$
begin
  update profiles set points_balance = points_balance + new.points where id = new.user_id;
  return new;
end $$;

create trigger trg_loyalty_balance
  after insert on loyalty_transactions
  for each row execute function apply_loyalty_tx();

-- ── Order status → history log ─────────────────────────────────
create or replace function log_order_status() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into order_status_history (order_id, status, created_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end $$;

create trigger trg_order_status_history
  after insert or update of status on orders
  for each row execute function log_order_status();
