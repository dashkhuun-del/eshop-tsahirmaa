import type { Metadata } from "next";
import { ShopShell, parseShopParams, type RawSearchParams } from "@/components/shop/shop-shell";

export const metadata: Metadata = { title: "Хайлт", robots: { index: false } };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const params = parseShopParams(sp);
  const q = params.q;
  return (
    <ShopShell
      params={params}
      eyebrow="Хайлтын илэрц"
      heading={q ? `"${q}" гэсэн хайлт` : "Хайлт"}
    />
  );
}
