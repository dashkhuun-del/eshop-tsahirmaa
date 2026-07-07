"use client";

import Image from "next/image";
import Link from "next/link";
import { Expand, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cld } from "@/lib/cloudinary";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductCardData } from "@/types/catalog";
import { ProductBadges } from "@/components/shop/badges";
import { FlowerMark } from "@/components/brand/flower-mark";
import { useQuickView } from "@/components/shop/quick-view";

export function ProductCard({
  p,
  priority = false,
}: {
  p: ProductCardData;
  priority?: boolean;
}) {
  const { open } = useQuickView();
  const onSale = p.salePrice !== null && p.salePrice < p.basePrice;
  const img = cld(p.imageUrl, 640);

  return (
    <motion.div
      className="group relative"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <Link href={`/product/${p.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
          <ProductBadges p={p} />
          {img ? (
            <Image
              src={img}
              alt={p.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FlowerMark className="h-12 w-12 opacity-20" />
            </div>
          )}
          {/* Quick view */}
          <button
            type="button"
            aria-label={`${p.name} — түргэн үзэх`}
            onClick={(e) => {
              e.preventDefault();
              open(p.slug);
            }}
            className="absolute bottom-3 right-3 z-10 hidden rounded-full bg-surface/90 p-2.5 shadow-md backdrop-blur transition-all hover:bg-accent hover:text-accent-foreground sm:block sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 space-y-1">
          <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-semibold", onSale && "text-accent")}>
              {formatPrice(onSale ? p.salePrice! : p.basePrice)}
            </span>
            {onSale && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(p.basePrice)}
              </span>
            )}
            {p.ratingCount > 0 && (
              <span className="ml-auto flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current text-accent" />
                {p.ratingAvg}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
