import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FlowerMark } from "@/components/brand/flower-mark";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getRootCategories, searchProducts } from "@/lib/queries/catalog";
import { cld } from "@/lib/cloudinary";
import { ProductStrip } from "@/components/shop/product-strip";

/**
 * Home page — real data wired in Module 2. Flash-sale countdown
 * and Instagram feed are added in Modules 4 and 7 respectively.
 */
export default async function HomePage() {
  const [categories, newArrivals, bestSellers, sale] = await Promise.all([
    getRootCategories(),
    searchProducts({ onlyNew: true, sort: "newest" }, 1, 8),
    searchProducts({ sort: "popular" }, 1, 8),
    searchProducts({ sale: true, sort: "newest" }, 1, 8),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.045]">
          <FlowerMark className="h-[52rem] w-[52rem] text-accent" />
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:py-36">
          <Reveal>
            <p className="eyebrow mb-6">Хавар · Зун 2026 цуглуулга</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Таны дэгжин байдлыг
              <span className="text-accent"> цэцэг шиг</span> дэлгэрүүлнэ
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Монгол эмэгтэйчүүдэд зориулсан premium загварын бутик —
              шуурхай хүргэлт, найдвартай төлбөр, баталгаат чанар.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto">
                  Дэлгүүр үзэх <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/new">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Шинэ ирсэн
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Category tiles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Ангилал</p>
              <h2 className="font-display text-2xl sm:text-3xl">Юу хайж байна?</h2>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
            >
              Бүгдийг үзэх <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(categories.length
            ? categories
            : [
                { slug: "shop", name: "Даашинз", image_url: null },
                { slug: "shop", name: "Цамц & Блуз", image_url: null },
                { slug: "shop", name: "Гадуур хувцас", image_url: null },
                { slug: "shop", name: "Гоёл чимэглэл", image_url: null },
              ]
          ).map((c, i) => {
            const img = cld(c.image_url, 500);
            const href = categories.length ? `/categories/${c.slug}` : "/shop";
            return (
              <Reveal key={`${c.slug}-${i}`} delay={i * 0.08}>
                <Link
                  href={href}
                  className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl bg-muted p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {img && (
                    <Image
                      src={img}
                      alt={c.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {!img && (
                    <FlowerMark className="mb-auto h-8 w-8 opacity-25 transition-opacity group-hover:opacity-60" />
                  )}
                  <div className={img ? "relative z-10 text-background" : ""}>
                    <p className="font-display text-lg">{c.name}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] opacity-80">
                      Үзэх →
                    </p>
                  </div>
                  {img && (
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  )}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <ProductStrip eyebrow="Шинэ ирсэн" title="Саяхан нэмэгдсэн" items={newArrivals.items} />
      <ProductStrip eyebrow="Хамгийн эрэлттэй" title="Онцлох бүтээгдэхүүн" items={bestSellers.items} />
      <ProductStrip eyebrow="Хугацаа хязгаартай" title="Хямдралтай санал" items={sale.items} />
    </>
  );
}
