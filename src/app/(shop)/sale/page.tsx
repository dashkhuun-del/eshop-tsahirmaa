import type { Metadata } from "next";
import { ShopShell, parseShopParams, type RawSearchParams } from "@/components/shop/shop-shell";

export const metadata: Metadata = { title: "Хямдрал", description: "Хямдралтай үнээр санал болгож буй бүтээгдэхүүнүүд." };

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const params = parseShopParams(sp, { sale: true });
  return (
    <ShopShell
      params={params}
      eyebrow="Хямдрал"
      heading="Хямдралтай бүтээгдэхүүн"
      description="Хугацаа хязгаартай, хямдралтай үнийн санал."
    />
  );
}
