import { Suspense } from "react";
import { getShopFilters, searchProducts } from "@/lib/queries/catalog";
import type { ShopParams } from "@/types/catalog";
import { FilterBar } from "@/components/shop/filter-bar";
import { InfiniteProductGrid } from "@/components/shop/infinite-grid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export type RawSearchParams = { [key: string]: string | string[] | undefined };

export function parseShopParams(
  sp: RawSearchParams,
  overrides: Partial<ShopParams> = {}
): ShopParams {
  const str = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined;
  const csv = (v: string | string[] | undefined) =>
    str(v)?.split(",").filter(Boolean);
  const num = (v: string | string[] | undefined) => {
    const n = Number(str(v));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const sort = str(sp.sort);
  return {
    q: str(sp.q)?.slice(0, 100),
    brands: csv(sp.brand),
    min: num(sp.min),
    max: num(sp.max),
    values: csv(sp.values),
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "popular" || sort === "rating"
        ? sort
        : "newest",
    ...overrides,
  };
}

export async function ShopShell({
  params,
  heading,
  eyebrow,
  description,
}: {
  params: ShopParams;
  heading: string;
  eyebrow?: string;
  description?: string;
}) {
  const [{ items, total }, filters] = await Promise.all([
    searchProducts(params, 1),
    getShopFilters(params.categoryPath),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl sm:text-4xl">{heading}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0" aria-label="Шүүлтүүр">
          <Suspense>
            <FilterBar filters={filters} />
          </Suspense>
        </aside>
        <div className="min-w-0 flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <InfiniteProductGrid initial={items} total={total} params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
