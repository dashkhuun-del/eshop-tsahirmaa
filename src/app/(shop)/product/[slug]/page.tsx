import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/catalog";
import { cld } from "@/lib/cloudinary";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductBuyBox } from "@/components/shop/product-buy-box";
import { ProductBadges } from "@/components/shop/badges";
import { ReviewsSection } from "@/components/shop/reviews-section";
import { ProductStrip } from "@/components/shop/product-strip";
import { ViewedAndRecommended } from "@/components/shop/viewed-and-recommended";
import type { ProductCardData } from "@/types/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.meta_title || product.name,
    description:
      product.meta_description ||
      product.description?.slice(0, 155) ||
      `${product.name} — Цахирмаа Boutique`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 155),
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = Array.isArray(product.category)
    ? product.category[0]
    : product.category;
  const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand;

  const related = category
    ? await getRelatedProducts(category.path, product.id)
    : [];

  const totalAvailable = product.variants.reduce((n, v) => n + v.available, 0);
  const cardForBadges: ProductCardData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.base_price),
    salePrice: product.sale_price === null ? null : Number(product.sale_price),
    ratingAvg: Number(product.rating_avg ?? 0),
    ratingCount: product.rating_count ?? 0,
    isNew: !!product.is_new,
    soldCount: product.sold_count ?? 0,
    imageUrl: product.images[0]?.url ?? null,
    available: totalAvailable,
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Breadcrumbs
          items={[
            ...(category
              ? [{ name: category.name, href: `/categories/${category.slug}` }]
              : []),
            { name: product.name },
          ]}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images.map((i) => ({ url: i.url, alt: i.alt }))}
          name={product.name}
        />

        <div className="lg:pt-2">
          <div className="mb-2 flex items-center gap-2">
            <ProductBadges p={cardForBadges} />
            {brand && (
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {brand.name}
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl">{product.name}</h1>
          {product.rating_count > 0 && (
            <a href="#reviews" className="mt-1 inline-block text-sm text-muted-foreground hover:text-accent">
              ★ {product.rating_avg} ({product.rating_count} үнэлгээ)
            </a>
          )}

          <div className="mt-6">
            <ProductBuyBox
              productId={product.id}
              slug={product.slug}
              name={product.name}
              basePrice={Number(product.base_price)}
              salePrice={product.sale_price === null ? null : Number(product.sale_price)}
              options={product.options.map((o) => ({
                id: o.id,
                name: o.name,
                values: o.values.map((v) => ({
                  id: v.id,
                  value: v.value,
                  color_hex: v.color_hex,
                })),
              }))}
              variants={product.variants.map((v) => ({
                id: v.id,
                title: v.title,
                price_override: v.price_override === null ? null : Number(v.price_override),
                optionValueIds: v.optionValueIds,
                available: v.available,
              }))}
              imageUrl={product.images[0]?.url ? cld(product.images[0].url, 640) : null}
            />
          </div>

          {product.description && (
            <div className="mt-8 border-t pt-6">
              <p className="mb-2 text-sm font-semibold">Тайлбар</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {product.attribute_values.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <p className="mb-3 text-sm font-semibold">Онцлог</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {product.attribute_values.map((av, i) => {
                  const attr = Array.isArray(av.attribute) ? av.attribute[0] : av.attribute;
                  const opt = Array.isArray(av.option) ? av.option[0] : av.option;
                  const value =
                    opt?.value ?? av.value_text ?? av.value_number ?? (av.value_boolean ? "Тийм" : "");
                  return (
                    <div key={i} className="contents">
                      <dt className="text-muted-foreground">{attr?.name}</dt>
                      <dd>
                        {value}
                        {attr?.unit ? ` ${attr.unit}` : ""}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <p className="mb-2 text-sm font-semibold">Хүргэлт & Буцаалт</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>🚚 Улаанбаатар хотод 24–48 цагт хүргэнэ</li>
              <li>🔄 7 хоногийн дотор үнэ төлбөргүй буцаалт</li>
              <li>💳 QPay, банкны апп, карт — найдвартай төлбөр</li>
            </ul>
          </div>
        </div>
      </div>

      <ReviewsSection
        reviews={product.reviews as never}
        ratingAvg={Number(product.rating_avg ?? 0)}
        ratingCount={product.rating_count ?? 0}
      />

      <ProductStrip eyebrow="Хамт авбал тохирно" title="Төстэй бүтээгдэхүүн" items={related} />

      <ViewedAndRecommended productId={product.id} />
    </div>
  );
}
