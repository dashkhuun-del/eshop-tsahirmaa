-- ════════════════════════════════════════════════════════════════
-- 0003_rls.sql — Row Level Security
-- Principles:
--   • Catalog: public read (active rows only), staff write
--   • Customer data: owner read/write only
--   • Orders: owner read; all writes via Server Actions (service role)
--   • Inventory / logs / settings: staff only
-- The service-role key bypasses RLS and is used ONLY inside trusted
-- Server Actions (checkout, webhooks) — never shipped to the client.
-- ════════════════════════════════════════════════════════════════

alter table profiles                 enable row level security;
alter table addresses                enable row level security;
alter table categories               enable row level security;
alter table brands                   enable row level security;
alter table products                 enable row level security;
alter table product_images           enable row level security;
alter table product_options          enable row level security;
alter table product_option_values    enable row level security;
alter table product_variants         enable row level security;
alter table variant_option_values    enable row level security;
alter table attributes               enable row level security;
alter table attribute_options        enable row level security;
alter table category_attributes      enable row level security;
alter table product_attribute_values enable row level security;
alter table warehouses               enable row level security;
alter table inventory_levels         enable row level security;
alter table stock_movements          enable row level security;
alter table inventory_transfers      enable row level security;
alter table inventory_transfer_items enable row level security;
alter table reviews                  enable row level security;
alter table review_images            enable row level security;
alter table wishlist_items           enable row level security;
alter table carts                    enable row level security;
alter table cart_items               enable row level security;
alter table coupons                  enable row level security;
alter table flash_sales              enable row level security;
alter table flash_sale_products      enable row level security;
alter table shipping_zones           enable row level security;
alter table orders                   enable row level security;
alter table order_items              enable row level security;
alter table order_status_history     enable row level security;
alter table payments                 enable row level security;
alter table loyalty_transactions     enable row level security;
alter table product_pairs            enable row level security;
alter table admin_logs               enable row level security;
alter table settings                 enable row level security;

-- ── Profiles ───────────────────────────────────────────────────
create policy "own profile read"   on profiles for select using (auth.uid() = id or is_staff());
create policy "own profile update" on profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));
  -- users cannot self-promote: role must stay unchanged

-- ── Addresses ──────────────────────────────────────────────────
create policy "own addresses" on addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "staff read addresses" on addresses for select using (is_staff());

-- ── Public catalog (read) / staff (write) ──────────────────────
create policy "public categories" on categories for select using (is_active or is_staff());
create policy "staff categories"  on categories for all using (is_staff()) with check (is_staff());

create policy "public brands" on brands for select using (is_active or is_staff());
create policy "staff brands"  on brands  for all using (is_staff()) with check (is_staff());

create policy "public products" on products for select using (is_active or is_staff());
create policy "staff products"  on products for all using (is_staff()) with check (is_staff());

create policy "public product_images" on product_images for select using (true);
create policy "staff product_images"  on product_images for all using (is_staff()) with check (is_staff());

create policy "public options"        on product_options       for select using (true);
create policy "staff options"         on product_options       for all using (is_staff()) with check (is_staff());
create policy "public option_values"  on product_option_values for select using (true);
create policy "staff option_values"   on product_option_values for all using (is_staff()) with check (is_staff());

create policy "public variants" on product_variants for select using (is_active or is_staff());
create policy "staff variants"  on product_variants for all using (is_staff()) with check (is_staff());

create policy "public vov" on variant_option_values for select using (true);
create policy "staff vov"  on variant_option_values for all using (is_staff()) with check (is_staff());

create policy "public attributes" on attributes for select using (true);
create policy "staff attributes"  on attributes for all using (is_staff()) with check (is_staff());
create policy "public attr_options" on attribute_options for select using (true);
create policy "staff attr_options"  on attribute_options for all using (is_staff()) with check (is_staff());
create policy "public cat_attrs" on category_attributes for select using (true);
create policy "staff cat_attrs"  on category_attributes for all using (is_staff()) with check (is_staff());
create policy "public pav" on product_attribute_values for select using (true);
create policy "staff pav"  on product_attribute_values for all using (is_staff()) with check (is_staff());

-- ── Inventory: staff only (storefront reads via variant_stock view
--    exposed through a security-definer RPC in Module 2) ─────────
create policy "staff warehouses" on warehouses for all using (is_staff()) with check (is_staff());
create policy "staff inventory"  on inventory_levels for all using (is_staff()) with check (is_staff());
create policy "staff movements"  on stock_movements  for all using (is_staff()) with check (is_staff());
create policy "staff transfers"  on inventory_transfers for all using (is_staff()) with check (is_staff());
create policy "staff transfer_items" on inventory_transfer_items for all using (is_staff()) with check (is_staff());

-- ── Reviews: public read approved; author write own ────────────
create policy "read approved reviews" on reviews for select
  using (is_approved or auth.uid() = user_id or is_staff());
create policy "write own review" on reviews for insert with check (auth.uid() = user_id);
create policy "update own review" on reviews for update using (auth.uid() = user_id);
create policy "staff moderate reviews" on reviews for all using (is_staff()) with check (is_staff());

create policy "read review images" on review_images for select using (true);
create policy "staff review images" on review_images for all using (is_staff()) with check (is_staff());

-- ── Wishlist ───────────────────────────────────────────────────
create policy "own wishlist" on wishlist_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Carts: authenticated own; guest carts via service role ─────
create policy "own cart" on carts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cart items" on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()));

-- ── Promotions / shipping: public read active, staff write ─────
create policy "public coupon lookup" on coupons for select using (is_active or is_staff());
create policy "staff coupons" on coupons for all using (is_staff()) with check (is_staff());

create policy "public flash sales" on flash_sales for select using (is_active or is_staff());
create policy "staff flash sales"  on flash_sales for all using (is_staff()) with check (is_staff());
create policy "public fsp" on flash_sale_products for select using (true);
create policy "staff fsp"  on flash_sale_products for all using (is_staff()) with check (is_staff());

create policy "public zones" on shipping_zones for select using (is_active or is_staff());
create policy "staff zones"  on shipping_zones for all using (is_staff()) with check (is_staff());

-- ── Orders: owner read; staff manage; inserts via service role ─
create policy "own orders" on orders for select
  using (auth.uid() = user_id or is_staff());
create policy "staff orders" on orders for update using (is_staff()) with check (is_staff());

create policy "own order items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff())));

create policy "own order history" on order_status_history for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff())));

create policy "own payments" on payments for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff())));

-- ── Loyalty ────────────────────────────────────────────────────
create policy "own loyalty" on loyalty_transactions for select
  using (auth.uid() = user_id or is_staff());
create policy "staff loyalty" on loyalty_transactions for insert with check (is_staff());

-- ── Recommendations: public read; job writes via service role ──
create policy "public pairs" on product_pairs for select using (true);

-- ── Admin logs: admins read, staff insert ──────────────────────
create policy "admin read logs" on admin_logs for select using (is_admin());
create policy "staff write logs" on admin_logs for insert with check (is_staff());

-- ── Settings: public read (banner, delivery text), staff write ─
create policy "public settings" on settings for select using (true);
create policy "staff settings"  on settings for all using (is_staff()) with check (is_staff());
