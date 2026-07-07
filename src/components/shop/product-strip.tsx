import type { ProductCardData } from "@/types/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/ui/reveal";

export function ProductStrip({
  title,
  eyebrow,
  items,
}: {
  title: string;
  eyebrow?: string;
  items: ProductCardData[];
}) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Reveal>
        <div className="mb-6">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
        </div>
      </Reveal>
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {items.map((p) => (
          <div key={p.id} className="w-40 shrink-0 snap-start sm:w-auto">
            <ProductCard p={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
