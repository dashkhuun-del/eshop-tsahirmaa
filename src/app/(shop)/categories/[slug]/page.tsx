import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/queries/catalog";
import { ShopShell, parseShopParams, type RawSearchParams } from "@/components/shop/shop-shell";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { FlowerMark } from "@/components/brand/flower-mark";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `${category.name} ангиллын бүтээгдэхүүнүүд.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const shopParams = parseShopParams(sp, { categoryPath: category.path });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <Breadcrumbs
        items={category.breadcrumbs.map((c, i, arr) => ({
          name: c.name,
          href: i < arr.length - 1 ? `/categories/${c.slug}` : undefined,
        }))}
      />

      {category.children.length > 0 && (
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {category.children.map((child) => (
            <Link
              key={child.slug}
              href={`/categories/${child.slug}`}
              className="group flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-accent"
            >
              <FlowerMark className="h-6 w-6 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
              <span className="text-sm font-medium">{child.name}</span>
            </Link>
          ))}
        </div>
      )}

      <ShopShell params={shopParams} eyebrow="Ангилал" heading={category.name} />
    </div>
  );
}
