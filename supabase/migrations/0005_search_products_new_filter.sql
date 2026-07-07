-- ════════════════════════════════════════════════════════════════
-- 0005_search_products_new_filter.sql
-- Additive change: adds p_only_new so /new can filter is_new=true
-- instead of merely sorting by recency. CREATE OR REPLACE keeps the
-- existing call signature backward-compatible (new param has a
-- default), so no other call site needs to change.
-- ════════════════════════════════════════════════════════════════

create or replace function search_products(
  p_query         text    default null,
  p_category_path text    default null,
  p_brand_slugs   text[]  default null,
  p_min_price     numeric default null,
  p_max_price     numeric default null,
  p_option_values text[]  default null,
  p_only_sale     boolean default false,
  p_only_featured boolean default false,
  p_sort          text    default 'newest',
  p_limit         int     default 12,
  p_offset        int     default 0,
  p_only_new      boolean default false
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
      and (not p_only_new or p.is_new)
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
