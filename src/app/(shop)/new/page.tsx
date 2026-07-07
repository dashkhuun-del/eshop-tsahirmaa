import type { Metadata } from "next";
import { ShopShell, parseShopParams, type RawSearchParams } from "@/components/shop/shop-shell";

export const metadata: Metadata = {
  title: "Шинэ ирсэн",
  description: "Цахирмаа Boutique-д саяхан нэмэгдсэн шинэ бүтээгдэхүүнүүд.",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const params = parseShopParams(sp, { onlyNew: true });
  return (
    <ShopShell
      params={params}
      eyebrow="Тайлбар"
      heading="Шинэ ирсэн"
      description="Хамгийн сүүлд нэмэгдсэн загваруудаа эхлээд танилцуулж байна."
    />
  );
}
