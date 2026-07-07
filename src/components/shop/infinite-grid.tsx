"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { loadMoreProducts } from "@/app/actions/catalog";
import type { ProductCardData, ShopParams } from "@/types/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shop/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Infinite scroll with graceful degradation:
 *  • IntersectionObserver auto-loads the next page
 *  • a visible "Цааш үзэх" button works without JS-observer support
 *  • first page is server-rendered (SEO + fast LCP)
 */
export function InfiniteProductGrid({
  initial,
  total,
  params,
}: {
  initial: ProductCardData[];
  total: number;
  params: ShopParams;
}) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = items.length < total;

  // reset when filters change
  const key = JSON.stringify(params);
  const lastKey = useRef(key);
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key;
      setItems(initial);
      setPage(1);
    }
  }, [key, initial]);

  const loadMore = useCallback(() => {
    if (pending || !hasMore) return;
    const next = page + 1;
    startTransition(async () => {
      const { items: more } = await loadMoreProducts(params, next);
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((m) => !seen.has(m.id))];
      });
      setPage(next);
    });
  }, [pending, hasMore, page, params]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore]);

  if (!items.length) {
    return (
      <EmptyState
        title="Илэрц олдсонгүй"
        description="Шүүлтүүрээ өөрчилж эсвэл өөр түлхүүр үгээр хайж үзнэ үү."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} p={p} priority={i < 4} />
        ))}
        {pending &&
          Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={`s${i}`} />
          ))}
      </div>
      <div ref={sentinel} aria-hidden className="h-px" />
      <div className="mt-10 flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">
          {items.length} / {total} бүтээгдэхүүн
        </p>
        {hasMore && (
          <Button variant="outline" onClick={loadMore} disabled={pending}>
            {pending ? "Ачаалж байна…" : "Цааш үзэх"}
          </Button>
        )}
      </div>
    </>
  );
}
