import type { Metadata } from "next";
import { ShopShell, parseShopParams, type RawSearchParams } from "@/components/shop/shop-shell";

export const metadata: Metadata = {
  title: "Эрэлттэй",
  description: "Хамгийн их зарагдсан, эрэлт ихтэй бүтээгдэхүүнүүд.",
};

export default async function BestSellersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const params = parseShopParams(sp, { sort: "popular" });
  return (
    <ShopShell
      params={params}
      eyebrow="Хамгийн эрэлттэй"
      heading="Эрэлттэй бүтээгдэхүүн"
      description="Манай үйлчлүүлэгчдийн хамгийн их сонгосон загварууд."
    />
  );
}
