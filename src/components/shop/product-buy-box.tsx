"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/shop/share-menu";
import { NotifyMeForm } from "@/components/shop/notify-me-form";
import { LIMITED_STOCK_MAX } from "@/types/catalog";

export interface BuyBoxOption {
  id: string;
  name: string;
  values: { id: string; value: string; color_hex: string | null }[];
}
export interface BuyBoxVariant {
  id: string;
  title: string;
  price_override: number | null;
  optionValueIds: string[];
  available: number;
}

export function ProductBuyBox({
  productId,
  slug,
  name,
  basePrice,
  salePrice,
  options,
  variants,
  imageUrl,
}: {
  productId: string;
  slug: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
  options: BuyBoxOption[];
  variants: BuyBoxVariant[];
  imageUrl: string | null;
}) {
  const router = useRouter();
  const { add } = useCart();
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);

  const variant = useMemo(() => {
    if (options.length === 0) return variants[0];
    if (Object.keys(selection).length < options.length) return undefined;
    return variants.find((v) =>
      options.every((o) => v.optionValueIds.includes(selection[o.id]))
    );
  }, [options, selection, variants]);

  const price = variant?.price_override ?? salePrice ?? basePrice;
  const onSale = salePrice !== null && salePrice < basePrice && !variant?.price_override;
  const complete = options.length === 0 || Object.keys(selection).length === options.length;
  const outOfStock = variant ? variant.available <= 0 : false;

  const buildLine = () => {
    if (!variant) return null;
    return {
      variantId: variant.id,
      productId,
      slug,
      name,
      variantTitle: variant.title,
      price: variant.price_override ?? price,
      image: imageUrl,
    };
  };

  const handleAdd = () => {
    if (!complete) {
      toast.error("Сонголтоо хийнэ үү");
      return;
    }
    if (outOfStock) {
      toast.error("Уучлаарай, дууссан байна");
      return;
    }
    const line = buildLine();
    if (!line) return;
    add(line, qty);
    toast.success("Сагсанд нэмэгдлээ");
  };

  const handleBuyNow = () => {
    if (!complete) {
      toast.error("Сонголтоо хийнэ үү");
      return;
    }
    if (outOfStock) {
      toast.error("Уучлаарай, дууссан байна");
      return;
    }
    const line = buildLine();
    if (!line) return;
    add(line, qty);
    router.push("/checkout");
  };

  const shareUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tsahirmaa.mn") + `/product/${slug}`;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl">{formatPrice(price)}</p>
          {onSale && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(basePrice)}
            </p>
          )}
        </div>
        <ShareMenu url={shareUrl} title={name} />
      </div>

      {options.map((o) => (
        <div key={o.id} className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {o.name}
            {selection[o.id] &&
              `: ${o.values.find((v) => v.id === selection[o.id])?.value}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {o.values.map((v) => {
              const active = selection[o.id] === v.id;
              // is this value even reachable given other selections?
              const reachable = variants.some(
                (variant) =>
                  variant.optionValueIds.includes(v.id) &&
                  Object.entries(selection).every(
                    ([oid, vid]) => oid === o.id || variant.optionValueIds.includes(vid)
                  )
              );
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!reachable}
                  onClick={() => setSelection((s) => ({ ...s, [o.id]: v.id }))}
                  aria-pressed={active}
                  className={cn(
                    "min-w-11 rounded-full border px-3.5 py-2 text-sm transition-colors",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : reachable
                        ? "hover:border-accent"
                        : "cursor-not-allowed opacity-30"
                  )}
                >
                  {v.color_hex && (
                    <span
                      className="mr-1.5 inline-block h-3 w-3 rounded-full border align-middle"
                      style={{ background: v.color_hex }}
                    />
                  )}
                  {v.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {complete && variant && variant.available > 0 && variant.available <= LIMITED_STOCK_MAX && (
        <p className="mt-3 text-xs font-medium text-danger">
          Зөвхөн {variant.available} ширхэг үлдлээ — яараарай!
        </p>
      )}

      {complete && outOfStock && variant && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-muted-foreground">
            Энэ сонголт түр дууссан байна.
          </p>
          <NotifyMeForm variantId={variant.id} />
        </div>
      )}

      {(!complete || !outOfStock) && (
        <>
          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm font-medium">Тоо ширхэг</span>
            <div className="ml-auto flex items-center rounded-full border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Хасах"
                className="p-2.5"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(variant?.available ?? 99, q + 1))}
                aria-label="Нэмэх"
                className="p-2.5"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 hidden gap-3 sm:flex">
            <Button variant="outline" size="lg" className="flex-1" onClick={handleAdd}>
              <ShoppingBag className="h-4 w-4" /> Сагслах
            </Button>
            <Button size="lg" className="flex-1" onClick={handleBuyNow}>
              <Zap className="h-4 w-4" /> Шууд авах
            </Button>
          </div>
        </>
      )}

      {/* Sticky mobile bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t bg-background/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur sm:hidden"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{name}</p>
          <p className="font-semibold text-accent">{formatPrice(price)}</p>
        </div>
        <Button variant="outline" size="md" onClick={handleAdd} disabled={complete && outOfStock}>
          <ShoppingBag className="h-4 w-4" />
        </Button>
        <Button size="md" onClick={handleBuyNow} disabled={complete && outOfStock}>
          <Zap className="h-4 w-4" /> Шууд авах
        </Button>
      </motion.div>
      {/* spacer so content isn't hidden behind the sticky bar */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
