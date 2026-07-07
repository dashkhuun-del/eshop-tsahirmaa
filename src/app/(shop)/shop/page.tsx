import type { Metadata } from "next";
import { ShopShell, parseShopParams, type RawSearchParams } from "@/components/shop/shop-shell";

export const metadata: Metadata = {
  title: "Дэлгүүр",
  description: "Цахирмаа Boutique-ийн бүх бүтээгдэхүүн — эмэгтэйчүүдийн дэгжин хувцас, гоёл чимэглэл.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const params = parseShopParams(sp);
  return <ShopShell params={params} eyebrow="Каталог" heading="Бүх бүтээгдэхүүн" />;
}
