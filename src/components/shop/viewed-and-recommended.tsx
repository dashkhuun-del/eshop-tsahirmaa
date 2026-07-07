"use client";

import { useEffect, useState } from "react";
import {
  fetchCardsByIds,
  fetchRecommendations,
} from "@/app/actions/catalog";
import {
  getRecentlyViewed,
  recordRecentlyViewed,
} from "@/hooks/use-recently-viewed";
import type { ProductCardData } from "@/types/catalog";
import { ProductStrip } from "@/components/shop/product-strip";

export function ViewedAndRecommended({ productId }: { productId: string }) {
  const [recent, setRecent] = useState<ProductCardData[]>([]);
  const [recommended, setRecommended] = useState<ProductCardData[]>([]);

  useEffect(() => {
    recordRecentlyViewed(productId);
    const ids = getRecentlyViewed();
    const others = ids.filter((id) => id !== productId);

    if (others.length) fetchCardsByIds(others).then(setRecent);
    fetchRecommendations(ids).then(setRecommended);
  }, [productId]);

  return (
    <>
      <ProductStrip
        eyebrow="Танд санал болгож байна"
        title="Танд таалагдаж магадгүй"
        items={recommended}
      />
      <ProductStrip
        eyebrow="Таны түүх"
        title="Саяхан үзсэн"
        items={recent}
      />
    </>
  );
}
