"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { getQuickView, type QuickViewData } from "@/app/actions/catalog";
import { cld } from "@/lib/cloudinary";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FlowerMark } from "@/components/brand/flower-mark";
import { useCart } from "@/hooks/use-cart";

const QuickViewContext = createContext<{ open: (slug: string) => void }>({
  open: () => {},
});

export const useQuickView = () => useContext(QuickViewContext);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<QuickViewData | null>(null);
  const open = useCallback((s: string) => {
    setSlug(s);
    setData(null);
    getQuickView(s).then((d) => setData(d));
  }, []);
  const close = () => setSlug(null);

  return (
    <QuickViewContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {slug && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-foreground/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Бүтээгдэхүүн түргэн үзэх"
              className="fixed inset-x-3 top-[8vh] z-[70] mx-auto max-h-[84vh] max-w-2xl overflow-y-auto rounded-xl border bg-background p-5 shadow-2xl sm:p-6"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <button
                onClick={close}
                aria-label="Хаах"
                className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
              {data ? (
                <QuickViewBody data={data} onDone={close} />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <div className="space-y-3 pt-2">
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </QuickViewContext.Provider>
  );
}

function QuickViewBody({
  data,
  onDone,
}: {
  data: QuickViewData;
  onDone: () => void;
}) {
  const { add } = useCart();
  const [selection, setSelection] = useState<Record<string, string>>({});

  const selectedIds = Object.values(selection);
  const variant =
    data.variants.find((v) =>
      data.options.every((o) =>
        v.optionValueIds.includes(selection[o.id] ?? "__none__")
      )
    ) ?? (data.options.length === 0 ? data.variants[0] : undefined);

  const price = variant?.price ?? data.salePrice ?? data.basePrice;
  const img = cld(data.images[0]?.url, 640);

  const handleAdd = () => {
    if (!variant) {
      toast.error("Хэмжээ, өнгөө сонгоно уу");
      return;
    }
    if (variant.available <= 0) {
      toast.error("Уучлаарай, энэ сонголт дууссан байна");
      return;
    }
    add({
      variantId: variant.id,
      productId: data.id,
      slug: data.slug,
      name: data.name,
      variantTitle: variant.title,
      price: variant.price,
      image: data.images[0]?.url ?? null,
    });
    toast.success("Сагсанд нэмэгдлээ");
    onDone();
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        {img ? (
          <Image src={img} alt={data.name} fill sizes="50vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FlowerMark className="h-12 w-12 opacity-20" />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <h2 className="font-display pr-8 text-xl">{data.name}</h2>
        <p className="mt-2 text-lg font-semibold text-accent">{formatPrice(price)}</p>

        {data.options.map((o) => (
          <div key={o.id} className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {o.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {o.values.map((v) => {
                const active = selection[o.id] === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() =>
                      setSelection((s) => ({ ...s, [o.id]: v.id }))
                    }
                    aria-pressed={active}
                    className={cn(
                      "min-w-10 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "hover:border-accent"
                    )}
                  >
                    {v.hex && (
                      <span
                        className="mr-1.5 inline-block h-3 w-3 rounded-full border align-middle"
                        style={{ background: v.hex }}
                      />
                    )}
                    {v.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-auto space-y-2 pt-6">
          <Button className="w-full" onClick={handleAdd}>
            Сагсанд нэмэх
          </Button>
          <Link
            href={`/product/${data.slug}`}
            onClick={onDone}
            className="block text-center text-sm text-muted-foreground underline-offset-4 hover:text-accent hover:underline"
          >
            Дэлгэрэнгүй үзэх
          </Link>
        </div>
        {selectedIds.length < data.options.length && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Сонголтоо хийж сагсанд нэмнэ үү
          </p>
        )}
      </div>
    </div>
  );
}
