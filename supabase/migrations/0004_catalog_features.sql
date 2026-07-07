-- ════════════════════════════════════════════════════════════════
-- 0004_catalog_features.sql — Module 2 additions
-- ════════════════════════════════════════════════════════════════

-- ── "Notify me when back in stock" ─────────────────────────────
create table stock_notifications (
  id          uuid primary key default uuid_generate_v4(),
  variant_id  uuid not null references product_variants(id) on delete cascade,
  email       text,
  phone       text,
  user_id     uuid references profiles(id) on delete set null,
  notified_at timestamptz,
  created_at  timestamptz not null default now(),
  check (email is not null or phone is not null),
  unique (variant_id, email),
  unique (variant_id, phone)
);
alter table stock_notifications enable row level security;
create policy "anyone can subscribe" on stock_notifications
  for insert with check (true);
create policy "staff manage notifications" on stock_notifications
  for all using (is_staff()) with check (is_staff());

-- ── Product search / filter RPC ────────────────────────────────
-- One round-trip for the shop grid: full-text + trigram search,
-- category-subtree, brand, price, size/colour option filters,
-- sorting, pagination, first image and live availability.
create or replace function search_products(
  p_query         text    default null,
  p_category_path text    default null,
  p_brand_slugs   text[]  default null,
  p_min_price     numeric default null,
  p_max_price     numeric default null,
  p_option_values text[]  default null,   -- sizes and/or colours
  p_only_sale     boolean default false,
  p_only_featured boolean default false,
  p_sort          text    default 'newest', -- newest|price_asc|price_desc|popular|rating
  p_limit         int     default 12,
  p_offset        int     default 0
) returns table (
  id uuid, name text, slug text,
  base_price numeric, sale_price numeric,
  rating_avg numeric, rating_count int,
  is_new boolean, sold_count int,
  image_url text, available int, total_count bigint
)
language sql stable security definer set search_path = public as $$
  with base as (
    select p.*
    from products p
    join categories c on c.id = p.category_id
    left join brands b on b.id = p.brand_id
    where p.is_active and c.is_active
      and (p_category_path is null
           or c.path = p_category_path
           or c.path like p_category_path || '/%')
      and (p_brand_slugs is null or b.slug = any(p_brand_slugs))
      and (p_min_price is null or coalesce(p.sale_price, p.base_price) >= p_min_price)
      and (p_max_price is null or coalesce(p.sale_price, p.base_price) <= p_max_price)
      and (not p_only_sale or p.sale_price is not null)
      and (not p_only_featured or p.is_featured)
      and (p_query is null
           or p.search_vector @@ plainto_tsquery('simple', p_query)
           or p.name ilike '%' || p_query || '%')
      and (p_option_values is null or exists (
        select 1
          from product_variants v
          join variant_option_values vov on vov.variant_id = v.id
          join product_option_values pov on pov.id = vov.option_value_id
         where v.product_id = p.id and v.is_active
           and pov.value = any(p_option_values)
      ))
  )
  select
    p.id, p.name, p.slug, p.base_price, p.sale_price,
    p.rating_avg, p.rating_count, p.is_new, p.sold_count,
    (select url from product_images pi
      where pi.product_id = p.id order by pi.sort_order limit 1),
    coalesce((select sum(il.quantity - il.reserved)::int
        from inventory_levels il
        join product_variants v on v.id = il.variant_id
       where v.product_id = p.id), 0),
    count(*) over ()
  from base p
  order by
    case when p_sort = 'price_asc'  then coalesce(p.sale_price, p.base_price) end asc,
    case when p_sort = 'price_desc' then coalesce(p.sale_price, p.base_price) end desc,
    case when p_sort = 'popular'    then p.sold_count end desc,
    case when p_sort = 'rating'     then p.rating_avg end desc,
    p.created_at desc
  limit p_limit offset p_offset;
$$;

-- ── Filter panel data for a category subtree ───────────────────
create or replace function get_shop_filters(p_category_path text default null)
returns jsonb language sql stable security definer set search_path = public as $$
  with scoped as (
    select p.id, p.brand_id, coalesce(p.sale_price, p.base_price) as price
    from products p join categories c on c.id = p.category_id
    where p.is_active
      and (p_category_path is null or c.path = p_category_path
           or c.path like p_category_path || '/%')
  )
  select jsonb_build_object(
    'brands', coalesce((
      select jsonb_agg(distinct jsonb_build_object('name', b.name, 'slug', b.slug))
      from scoped s join brands b on b.id = s.brand_id), '[]'),
    'options', coalesce((
      select jsonb_agg(o) from (
        select jsonb_build_object(
          'name', po.name,
          'values', jsonb_agg(distinct jsonb_build_object(
            'value', pov.value, 'hex', pov.color_hex))
        ) as o
        from scoped s
        join product_options po on po.product_id = s.id
        join product_option_values pov on pov.option_id = po.id
        group by po.name
      ) q), '[]'),
    'price_min', coalesce((select min(price) from scoped), 0),
    'price_max', coalesce((select max(price) from scoped), 0)
  );
$$;
