import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import type { ProductCardData, ShopFilters, ShopParams } from "@/types/catalog";

const PAGE_SIZE = 12;

/* eslint-disable @typescript-eslint/no-explicit-any */
function toCard(row: any): ProductCardData {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    basePrice: Number(row.base_price),
    salePrice: row.sale_price === null ? null : Number(row.sale_price),
    ratingAvg: Number(row.rating_avg ?? 0),
    ratingCount: row.rating_count ?? 0,
    isNew: !!row.is_new,
    soldCount: row.sold_count ?? 0,
    imageUrl: row.image_url ?? null,
    available: row.available ?? 0,
  };
}

export async function searchProducts(
  params: ShopParams,
  page = 1,
  limit = PAGE_SIZE
): Promise<{ items: ProductCardData[]; total: number }> {
  if (!supabaseConfigured) return { items: [], total: 0 };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_products", {
    p_query: params.q ?? null,
    p_category_path: params.categoryPath ?? null,
    p_brand_slugs: params.brands?.length ? params.brands : null,
    p_min_price: params.min ?? null,
    p_max_price: params.max ?? null,
    p_option_values: params.values?.length ? params.values : null,
    p_only_sale: params.sale ?? false,
    p_only_featured: params.featured ?? false,
    p_only_new: params.onlyNew ?? false,
    p_sort: params.sort ?? "newest",
    p_limit: limit,
    p_offset: (page - 1) * limit,
  });
  if (error || !data) return { items: [], total: 0 };
  return {
    items: data.map(toCard),
    total: data[0]?.total_count ? Number(data[0].total_count) : 0,
  };
}

export async function getShopFilters(
  categoryPath?: string
): Promise<ShopFilters> {
  const empty: ShopFilters = { brands: [], options: [], price_min: 0, price_max: 0 };
  if (!supabaseConfigured) return empty;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_shop_filters", {
    p_category_path: categoryPath ?? null,
  });
  return (data as ShopFilters) ?? empty;
}

export async function getRootCategories() {
  if (!supabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, path, image_url")
    .eq("is_active", true)
    .eq("depth", 0)
    .order("sort_order");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string) {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, path, depth, description, parent_id")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (!category) return null;

  const segments = category.path.split("/");
  const [{ data: crumbs }, { data: children }] = await Promise.all([
    supabase.from("categories").select("name, slug").in("slug", segments),
    supabase
      .from("categories")
      .select("name, slug")
      .eq("parent_id", category.id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);
  const breadcrumbs = segments
    .map((s: string) => crumbs?.find((c) => c.slug === s))
    .filter(Boolean) as { name: string; slug: string }[];
  return { ...category, breadcrumbs, children: children ?? [] };
}

export async function getProductBySlug(slug: string) {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      `id, name, slug, description, base_price, sale_price, sku, is_new,
       sold_count, rating_avg, rating_count, meta_title, meta_description,
       category:categories(id, name, slug, path),
       brand:brands(name, slug),
       images:product_images(id, url, alt, option_value_id, sort_order),
       options:product_options(id, name, position,
         values:product_option_values(id, value, color_hex, position)),
       variants:product_variants(id, title, sku, barcode, price_override, is_active,
         option_values:variant_option_values(option_value_id)),
       attribute_values:product_attribute_values(
         value_text, value_number, value_boolean,
         attribute:attributes(name, unit),
         option:attribute_options(value))`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (!product) return null;

  const variantIds = (product.variants ?? []).map((v) => v.id);
  const [{ data: stock }, { data: reviews }] = await Promise.all([
    variantIds.length
      ? supabase.from("variant_stock").select("*").in("variant_id", variantIds)
      : Promise.resolve({ data: [] as { variant_id: string; available: number }[] }),
    supabase
      .from("reviews")
      .select(
        `id, rating, comment, created_at,
         author:profiles(full_name),
         images:review_images(url)`
      )
      .eq("product_id", product.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const stockMap = new Map(
    (stock ?? []).map((s) => [s.variant_id, s.available as number])
  );

  return {
    ...product,
    images: (product.images ?? []).sort((a, b) => a.sort_order - b.sort_order),
    options: (product.options ?? [])
      .sort((a, b) => a.position - b.position)
      .map((o) => ({
        ...o,
        values: (o.values ?? []).sort((a, b) => a.position - b.position),
      })),
    variants: (product.variants ?? [])
      .filter((v) => v.is_active)
      .map((v) => ({
        ...v,
        optionValueIds: (v.option_values ?? []).map((x) => x.option_value_id),
        available: stockMap.get(v.id) ?? 0,
      })),
    reviews: reviews ?? [],
  };
}

export async function getRelatedProducts(
  categoryPath: string,
  excludeId: string,
  limit = 8
): Promise<ProductCardData[]> {
  const rootPath = categoryPath.split("/")[0];
  const { items } = await searchProducts(
    { categoryPath: rootPath, sort: "popular" },
    1,
    limit + 1
  );
  return items.filter((p) => p.id !== excludeId).slice(0, limit);
}

export async function getCardsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (!supabaseConfigured || !ids.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, base_price, sale_price, rating_avg, rating_count, is_new, sold_count, images:product_images(url, sort_order)"
    )
    .in("id", ids.slice(0, 12))
    .eq("is_active", true);
  const cards = (data ?? []).map((p) =>
    toCard({
      ...p,
      image_url: p.images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url,
      available: 1, // exact stock not needed for strips
    })
  );
  // preserve caller order (recency)
  return ids
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean) as ProductCardData[];
}

/**
 * Personalized-lite recommendations:
 * frequently-bought pairs of the viewed products, topped up with
 * popular items from the same categories, excluding already-seen.
 */
export async function getRecommendations(
  recentIds: string[],
  limit = 8
): Promise<ProductCardData[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createClient();

  let ids: string[] = [];
  if (recentIds.length) {
    const { data: pairs } = await supabase
      .from("product_pairs")
      .select("paired_product_id, pair_count")
      .in("product_id", recentIds.slice(0, 10))
      .order("pair_count", { ascending: false })
      .limit(limit);
    ids = (pairs ?? []).map((p) => p.paired_product_id);
  }

  if (ids.length < limit && recentIds.length) {
    const { data: cats } = await supabase
      .from("products")
      .select("category:categories(path)")
      .in("id", recentIds.slice(0, 5));
    const roots = [
      ...new Set(
        (cats ?? [])
          .map((c) => {
            const cat = Array.isArray(c.category) ? c.category[0] : c.category;
            return (cat as { path?: string } | null)?.path?.split("/")[0];
          })
          .filter(Boolean)
      ),
    ] as string[];
    for (const root of roots) {
      const { items } = await searchProducts(
        { categoryPath: root, sort: "popular" },
        1,
        limit
      );
      ids.push(...items.map((i) => i.id));
    }
  }

  if (!ids.length) {
    const { items } = await searchProducts({ sort: "popular" }, 1, limit);
    return items;
  }

  const unique = [...new Set(ids)].filter((id) => !recentIds.includes(id));
  return (await getCardsByIds(unique)).slice(0, limit);
}
