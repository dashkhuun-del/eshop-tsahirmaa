-- ════════════════════════════════════════════════════════════════
-- seed.sql — initial data (run once after migrations)
-- Demonstrates: multi-level categories, per-department attributes,
-- generalized variants, multi-warehouse inventory.
-- ════════════════════════════════════════════════════════════════

-- ── Default warehouse ──────────────────────────────────────────
insert into warehouses (code, name, address, is_default) values
  ('UB-MAIN', 'Улаанбаатар — Төв агуулах', 'СБД, 1-р хороо', true);

-- ── Shipping zones ─────────────────────────────────────────────
insert into shipping_zones (name, fee, free_shipping_over, eta_text, sort_order) values
  ('Улаанбаатар хот',      6000,  150000, '24–48 цаг', 1),
  ('Орон нутгийн төв',     12000, 300000, '2–4 хоног', 2),
  ('Хөдөө орон нутаг',     18000, null,   '4–7 хоног', 3);

-- ── Categories: 3 levels deep (department store ready) ─────────
insert into categories (id, name, slug, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Эмэгтэй хувцас', 'emegtei-huvtsas', 1),
  ('11111111-1111-1111-1111-111111111102', 'Гоо сайхан',     'goo-saihan',      2),
  ('11111111-1111-1111-1111-111111111103', 'Гоёл чимэглэл',  'goyol-chimeglel', 3);

insert into categories (id, parent_id, name, slug, sort_order) values
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 'Даашинз',        'daashinz', 1),
  ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111101', 'Цамц & Блуз',    'tsamts-bluz', 2),
  ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111101', 'Гадуур хувцас',  'gaduur-huvtsas', 3),
  ('11111111-1111-1111-1111-111111111121', '11111111-1111-1111-1111-111111111102', 'Үнэртэй ус',     'unertei-us', 1);

insert into categories (parent_id, name, slug, sort_order) values
  ('11111111-1111-1111-1111-111111111111', 'Урт даашинз',  'urt-daashinz', 1),
  ('11111111-1111-1111-1111-111111111111', 'Богино даашинз','bogino-daashinz', 2);

-- ── Attributes: differ by department ───────────────────────────
insert into attributes (id, code, name, input_type, is_filterable, unit) values
  ('22222222-2222-2222-2222-222222222201', 'material', 'Материал',        'select', true,  null),
  ('22222222-2222-2222-2222-222222222202', 'season',   'Улирал',          'select', true,  null),
  ('22222222-2222-2222-2222-222222222203', 'volume',   'Эзлэхүүн',        'number', false, 'мл'),
  ('22222222-2222-2222-2222-222222222204', 'warranty', 'Баталгаат хугацаа','number', false, 'сар');

insert into attribute_options (attribute_id, value, sort_order) values
  ('22222222-2222-2222-2222-222222222201', 'Хөвөн', 1),
  ('22222222-2222-2222-2222-222222222201', 'Торго', 2),
  ('22222222-2222-2222-2222-222222222201', 'Ноолуур', 3),
  ('22222222-2222-2222-2222-222222222201', 'Маалинга', 4),
  ('22222222-2222-2222-2222-222222222202', 'Хавар / Зун', 1),
  ('22222222-2222-2222-2222-222222222202', 'Намар / Өвөл', 2),
  ('22222222-2222-2222-2222-222222222202', '4 улирал', 3);

-- fashion department gets material + season; cosmetics gets volume
insert into category_attributes (category_id, attribute_id, is_required) values
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', true),
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202', false),
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203', true);

-- ── Brand ──────────────────────────────────────────────────────
insert into brands (id, name, slug) values
  ('33333333-3333-3333-3333-333333333301', 'Tsahirmaa Collection', 'tsahirmaa-collection');

-- ── Demo product: dress with Size × Color variants ─────────────
insert into products (id, name, slug, description, category_id, brand_id, sku, base_price, sale_price, is_featured)
values (
  '44444444-4444-4444-4444-444444444401',
  'Торгон урт даашинз', 'torgon-urt-daashinz',
  'Зөөлөн торгон даавуугаар урласан, дэгжин урт даашинз. Онцгой үдэшлэг, ёслолын арга хэмжээнд төгс зохицно.',
  (select id from categories where slug = 'urt-daashinz'),
  '33333333-3333-3333-3333-333333333301',
  'TB-DRS-001', 289000, 249000, true
);

insert into product_options (id, product_id, name, position) values
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'Хэмжээ', 1),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 'Өнгө',   2);

insert into product_option_values (id, option_id, value, color_hex, position) values
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555501', 'S', null, 1),
  ('66666666-6666-6666-6666-666666666602', '55555555-5555-5555-5555-555555555501', 'M', null, 2),
  ('66666666-6666-6666-6666-666666666603', '55555555-5555-5555-5555-555555555502', 'Ягаан бор', '#6e2e4b', 1),
  ('66666666-6666-6666-6666-666666666604', '55555555-5555-5555-5555-555555555502', 'Цайвар', '#efeae5', 2);

insert into product_variants (id, product_id, title, sku, barcode) values
  ('77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444401', 'S / Ягаан бор', 'TB-DRS-001-S-MB', '8800000000011'),
  ('77777777-7777-7777-7777-777777777702', '44444444-4444-4444-4444-444444444401', 'M / Ягаан бор', 'TB-DRS-001-M-MB', '8800000000012'),
  ('77777777-7777-7777-7777-777777777703', '44444444-4444-4444-4444-444444444401', 'M / Цайвар',    'TB-DRS-001-M-CR', '8800000000013');

insert into variant_option_values (variant_id, option_value_id) values
  ('77777777-7777-7777-7777-777777777701', '66666666-6666-6666-6666-666666666601'),
  ('77777777-7777-7777-7777-777777777701', '66666666-6666-6666-6666-666666666603'),
  ('77777777-7777-7777-7777-777777777702', '66666666-6666-6666-6666-666666666602'),
  ('77777777-7777-7777-7777-777777777702', '66666666-6666-6666-6666-666666666603'),
  ('77777777-7777-7777-7777-777777777703', '66666666-6666-6666-6666-666666666602'),
  ('77777777-7777-7777-7777-777777777703', '66666666-6666-6666-6666-666666666604');

insert into inventory_levels (variant_id, warehouse_id, quantity, low_stock_threshold)
select v.id, w.id, 10, 3
from product_variants v cross join warehouses w where w.code = 'UB-MAIN';

insert into product_attribute_values (product_id, attribute_id, option_id)
values ('44444444-4444-4444-4444-444444444401',
        '22222222-2222-2222-2222-222222222201',
        (select id from attribute_options where value = 'Торго'));

-- ── Store settings ─────────────────────────────────────────────
insert into settings (key, value) values
  ('store_info',        '{"phone":"7700-0000","email":"info@tsahirmaa.mn","facebook":"","instagram":"","hours":"Даваа–Ням 10:00–20:00"}'),
  ('announcement',      '{"text":"150,000₮-с дээш захиалгад Улаанбаатар хотод хүргэлт үнэгүй","enabled":true}'),
  ('loyalty',           '{"earn_percent":2,"point_value":1,"enabled":true}'),
  ('low_stock_default', '{"threshold":5}');

-- ═══ After creating your admin account via the Register page: ═══
--   select promote_to_admin('таны@имэйл.mn');
