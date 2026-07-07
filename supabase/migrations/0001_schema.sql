-- ════════════════════════════════════════════════════════════════
-- Tsahirmaa Boutique — 0001_schema.sql
-- Core relational schema. Designed to scale from a fashion boutique
-- to a multi-department online store without structural migrations:
--   • unlimited category depth (parent_id + materialized path)
--   • generalized variant options (not hard-coded size/color)
--   • per-category product attributes (EAV, typed)
--   • multi-warehouse inventory with movements & transfers
-- ════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm; -- fuzzy search on Mongolian names

-- ── Enums ──────────────────────────────────────────────────────
create type user_role         as enum ('customer','manager','admin');
create type order_status      as enum ('pending','processing','packed','shipped','delivered','cancelled');
create type payment_status    as enum ('unpaid','paid','refunded','failed');
create type payment_provider  as enum ('qpay','bank_transfer');
create type coupon_type       as enum ('percent','fixed','free_shipping');
create type attribute_input   as enum ('text','number','boolean','select','multiselect');
create type movement_type     as enum ('purchase','sale','return','adjustment','transfer_in','transfer_out');
create type loyalty_tx_type   as enum ('earn','redeem','adjust','expire');
create type transfer_status   as enum ('draft','in_transit','received','cancelled');

-- ── Users ──────────────────────────────────────────────────────
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  email           text,
  role            user_role not null default 'customer',
  points_balance  integer not null default 0 check (points_balance >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table addresses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  label        text,                       -- "Гэр", "Ажил"
  city         text not null,              -- Улаанбаатар / аймаг
  district     text not null,              -- дүүрэг / сум
  khoroo       text,
  full_address text not null,
  phone        text not null,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index on addresses(user_id);

-- ── Catalog: categories (unlimited depth) ──────────────────────
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  parent_id   uuid references categories(id) on delete restrict,
  name        text not null,
  slug        text not null unique,
  path        text not null default '',   -- maintained by trigger: 'emegtei/daashinz'
  depth       int  not null default 0,
  description text,
  image_url   text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index on categories(parent_id);
create index categories_path_idx on categories using btree (path text_pattern_ops); -- subtree: path LIKE 'emegtei/%'

create table brands (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  logo_url   text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Catalog: products ──────────────────────────────────────────
create table products (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  slug             text not null unique,
  description      text,
  category_id      uuid not null references categories(id),
  brand_id         uuid references brands(id),
  sku              text unique,                  -- base SKU; variants carry their own
  base_price       numeric(12,0) not null check (base_price >= 0),   -- ₮, no decimals
  sale_price       numeric(12,0) check (sale_price >= 0),
  cost_price       numeric(12,0),
  is_new           boolean not null default true,
  is_featured      boolean not null default false,
  is_active        boolean not null default true,
  rating_avg       numeric(2,1) not null default 0,
  rating_count     int not null default 0,
  sold_count       int not null default 0,       -- best-sellers ranking
  meta_title       text,
  meta_description text,
  search_vector    tsvector,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on products(category_id) where is_active;
create index on products(brand_id) where is_active;
create index products_search_idx on products using gin(search_vector);
create index products_name_trgm_idx on products using gin(name gin_trgm_ops);

create table product_images (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references products(id) on delete cascade,
  cloudinary_id   text,
  url             text not null,
  alt             text,
  option_value_id uuid,   -- optional: tie image to e.g. a colour (FK added below)
  sort_order      int not null default 0
);
create index on product_images(product_id);

-- ── Generalized variant options (Shopify model) ────────────────
-- Fashion: Хэмжээ + Өнгө. Cosmetics: Эзлэхүүн. Electronics: Багтаамж.
create table product_options (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name       text not null,               -- 'Хэмжээ', 'Өнгө', 'Эзлэхүүн'
  position   int not null default 0,
  unique (product_id, name)
);

create table product_option_values (
  id         uuid primary key default uuid_generate_v4(),
  option_id  uuid not null references product_options(id) on delete cascade,
  value      text not null,               -- 'M', 'Улаан', '50мл'
  color_hex  text,                        -- only for colour swatches
  position   int not null default 0,
  unique (option_id, value)
);
alter table product_images
  add constraint product_images_option_value_fk
  foreign key (option_value_id) references product_option_values(id) on delete set null;

create table product_variants (
  id             uuid primary key default uuid_generate_v4(),
  product_id     uuid not null references products(id) on delete cascade,
  title          text not null default '',      -- 'M / Улаан' (maintained by app)
  sku            text unique,
  barcode        text,                          -- EAN/UPC — POS scanner ready
  price_override numeric(12,0) check (price_override >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);
create index on product_variants(product_id);
create index on product_variants(barcode);

create table variant_option_values (
  variant_id      uuid not null references product_variants(id) on delete cascade,
  option_value_id uuid not null references product_option_values(id) on delete cascade,
  primary key (variant_id, option_value_id)
);

-- ── Category-scoped product attributes (typed EAV) ─────────────
create table attributes (
  id            uuid primary key default uuid_generate_v4(),
  code          text not null unique,      -- 'material', 'season', 'volume_ml'
  name          text not null,             -- 'Материал', 'Улирал'
  input_type    attribute_input not null default 'text',
  unit          text,                      -- 'мл', 'гр', 'см'
  is_filterable boolean not null default false,
  sort_order    int not null default 0
);

create table attribute_options (
  id           uuid primary key default uuid_generate_v4(),
  attribute_id uuid not null references attributes(id) on delete cascade,
  value        text not null,
  sort_order   int not null default 0,
  unique (attribute_id, value)
);

-- which attributes apply to which category subtree
create table category_attributes (
  category_id  uuid not null references categories(id) on delete cascade,
  attribute_id uuid not null references attributes(id) on delete cascade,
  is_required  boolean not null default false,
  primary key (category_id, attribute_id)
);

create table product_attribute_values (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id) on delete cascade,
  attribute_id  uuid not null references attributes(id) on delete cascade,
  value_text    text,
  value_number  numeric,
  value_boolean boolean,
  option_id     uuid references attribute_options(id) on delete cascade,
  unique (product_id, attribute_id, option_id)
);
create index on product_attribute_values(product_id);
create index on product_attribute_values(attribute_id, option_id); -- filtering

-- ── Multi-warehouse inventory ──────────────────────────────────
create table warehouses (
  id         uuid primary key default uuid_generate_v4(),
  code       text not null unique,          -- 'UB-MAIN'
  name       text not null,
  address    text,
  is_default boolean not null default false,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table inventory_levels (
  variant_id          uuid not null references product_variants(id) on delete cascade,
  warehouse_id        uuid not null references warehouses(id) on delete cascade,
  quantity            int not null default 0 check (quantity >= 0),
  reserved            int not null default 0 check (reserved >= 0),
  low_stock_threshold int not null default 5,
  updated_at          timestamptz not null default now(),
  primary key (variant_id, warehouse_id)
);

create table stock_movements (
  id           uuid primary key default uuid_generate_v4(),
  variant_id   uuid not null references product_variants(id) on delete cascade,
  warehouse_id uuid not null references warehouses(id),
  type         movement_type not null,
  quantity     int not null,               -- signed: sale = negative
  reference_id uuid,                       -- order / transfer id
  note         text,
  created_by   uuid references profiles(id),
  created_at   timestamptz not null default now()
);
create index on stock_movements(variant_id, created_at desc);

create table inventory_transfers (
  id                uuid primary key default uuid_generate_v4(),
  from_warehouse_id uuid not null references warehouses(id),
  to_warehouse_id   uuid not null references warehouses(id),
  status            transfer_status not null default 'draft',
  note              text,
  created_by        uuid references profiles(id),
  created_at        timestamptz not null default now(),
  received_at       timestamptz,
  check (from_warehouse_id <> to_warehouse_id)
);

create table inventory_transfer_items (
  transfer_id uuid not null references inventory_transfers(id) on delete cascade,
  variant_id  uuid not null references product_variants(id),
  quantity    int not null check (quantity > 0),
  primary key (transfer_id, variant_id)
);

-- sellable stock across warehouses
create view variant_stock as
select variant_id, sum(quantity - reserved)::int as available
from inventory_levels group by variant_id;

-- ── Reviews / wishlist ─────────────────────────────────────────
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

create table review_images (
  id            uuid primary key default uuid_generate_v4(),
  review_id     uuid not null references reviews(id) on delete cascade,
  cloudinary_id text,
  url           text not null
);

create table wishlist_items (
  user_id    uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ── Cart ───────────────────────────────────────────────────────
create table carts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,  -- null = guest
  token      uuid not null default uuid_generate_v4() unique, -- guest cookie
  updated_at timestamptz not null default now()
);
create unique index carts_user_uidx on carts(user_id) where user_id is not null;

create table cart_items (
  id              uuid primary key default uuid_generate_v4(),
  cart_id         uuid not null references carts(id) on delete cascade,
  variant_id      uuid not null references product_variants(id) on delete cascade,
  quantity        int not null default 1 check (quantity > 0),
  saved_for_later boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (cart_id, variant_id, saved_for_later)
);

-- ── Promotions ─────────────────────────────────────────────────
create table coupons (
  id               uuid primary key default uuid_generate_v4(),
  code             text not null unique,
  type             coupon_type not null,
  value            numeric(12,0) not null default 0,  -- percent or ₮
  min_order_amount numeric(12,0) not null default 0,
  max_uses         int,
  used_count       int not null default 0,
  starts_at        timestamptz,
  expires_at       timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create table flash_sales (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  discount_percent int not null check (discount_percent between 1 and 90),
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  is_active        boolean not null default true,
  check (ends_at > starts_at)
);

create table flash_sale_products (
  flash_sale_id uuid not null references flash_sales(id) on delete cascade,
  product_id    uuid not null references products(id) on delete cascade,
  primary key (flash_sale_id, product_id)
);

-- ── Shipping ───────────────────────────────────────────────────
create table shipping_zones (
  id                 uuid primary key default uuid_generate_v4(),
  name               text not null,          -- Улаанбаатар / Орон нутгийн төв / Хөдөө
  fee                numeric(12,0) not null default 0,
  free_shipping_over numeric(12,0),
  eta_text           text,                   -- '24–48 цаг'
  sort_order         int not null default 0,
  is_active          boolean not null default true
);

-- ── Orders ─────────────────────────────────────────────────────
create sequence order_number_seq;

create table orders (
  id               uuid primary key default uuid_generate_v4(),
  order_number     text not null unique,     -- TB-2026-00001 (trigger)
  user_id          uuid references profiles(id),   -- null = guest
  status           order_status not null default 'pending',
  payment_status   payment_status not null default 'unpaid',
  payment_method   payment_provider,
  customer_name    text not null,
  phone            text not null,
  email            text,
  city             text not null,
  district         text not null,
  address          text not null,
  notes            text,
  shipping_zone_id uuid references shipping_zones(id),
  warehouse_id     uuid references warehouses(id),  -- fulfilled from
  coupon_id        uuid references coupons(id),
  subtotal         numeric(12,0) not null,
  discount_amount  numeric(12,0) not null default 0,
  points_used      int not null default 0,
  shipping_fee     numeric(12,0) not null default 0,
  total            numeric(12,0) not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on orders(user_id, created_at desc);
create index on orders(status);

create table order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references orders(id) on delete cascade,
  variant_id   uuid references product_variants(id) on delete set null,
  -- snapshot: survives later product edits/deletes
  product_name text not null,
  variant_title text not null default '',
  sku          text,
  unit_price   numeric(12,0) not null,
  quantity     int not null check (quantity > 0)
);
create index on order_items(order_id);
create index on order_items(variant_id); -- frequently-bought-together job

create table order_status_history (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid not null references orders(id) on delete cascade,
  status     order_status not null,
  note       text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table payments (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references orders(id) on delete cascade,
  provider     payment_provider not null,
  invoice_id   text,
  amount       numeric(12,0) not null,
  status       payment_status not null default 'unpaid',
  paid_at      timestamptz,
  raw_response jsonb,
  created_at   timestamptz not null default now()
);

-- ── Loyalty ────────────────────────────────────────────────────
create table loyalty_transactions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  order_id   uuid references orders(id) on delete set null,
  type       loyalty_tx_type not null,
  points     int not null,                 -- signed
  note       text,
  created_at timestamptz not null default now()
);
create index on loyalty_transactions(user_id, created_at desc);

-- ── Recommendations / audit / settings ─────────────────────────
create table product_pairs (          -- frequently bought together (nightly job)
  product_id        uuid not null references products(id) on delete cascade,
  paired_product_id uuid not null references products(id) on delete cascade,
  pair_count        int not null default 0,
  primary key (product_id, paired_product_id)
);

create table admin_logs (
  id        uuid primary key default uuid_generate_v4(),
  admin_id  uuid references profiles(id),
  action    text not null,                -- 'product.update', 'order.status'
  entity    text not null,
  entity_id uuid,
  changes   jsonb,
  created_at timestamptz not null default now()
);
create index on admin_logs(created_at desc);

create table settings (
  key   text primary key,
  value jsonb not null
);
