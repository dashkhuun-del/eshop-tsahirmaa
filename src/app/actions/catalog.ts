"use server";

import { z } from "zod";
import {
  searchProducts,
  getCardsByIds,
  getRecommendations,
  getProductBySlug,
} from "@/lib/queries/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/config";
import { mnPhone } from "@/lib/validators/auth";
import type { ShopParams } from "@/types/catalog";

/** Infinite scroll: next page of product cards. */
export async function loadMoreProducts(params: ShopParams, page: number) {
  return searchProducts(params, Math.max(1, Math.min(page, 500)));
}

/** Quick-view popup payload. */
export async function getQuickView(slug: string) {
  const p = await getProductBySlug(slug);
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: Number(p.base_price),
    salePrice: p.sale_price === null ? null : Number(p.sale_price),
    images: p.images.slice(0, 4).map((i) => ({ url: i.url, alt: i.alt })),
    options: p.options.map((o) => ({
      id: o.id,
      name: o.name,
      values: o.values.map((v) => ({ id: v.id, value: v.value, hex: v.color_hex })),
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: Number(v.price_override ?? p.sale_price ?? p.base_price),
      available: v.available,
      optionValueIds: v.optionValueIds,
    })),
  };
}

export type QuickViewData = NonNullable<Awaited<ReturnType<typeof getQuickView>>>;

/** Recently-viewed strip + personalized recommendations. */
export async function fetchCardsByIds(ids: string[]) {
  return getCardsByIds(z.array(z.string().uuid()).max(12).parse(ids));
}

export async function fetchRecommendations(recentIds: string[]) {
  return getRecommendations(
    z.array(z.string().uuid()).max(20).catch([]).parse(recentIds)
  );
}

/** "Notify me when back in stock" */
const notifySchema = z.object({
  variantId: z.string().uuid(),
  email: z.string().email("Имэйл хаяг буруу байна").optional().or(z.literal("")),
  phone: mnPhone.optional().or(z.literal("")),
});

export async function notifyWhenInStock(input: {
  variantId: string;
  email?: string;
  phone?: string;
}): Promise<{ ok: boolean; message: string }> {
  const parsed = notifySchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Алдаа" };
  const { variantId, email, phone } = parsed.data;
  if (!email && !phone)
    return { ok: false, message: "Имэйл эсвэл утасны дугаараа оруулна уу" };
  if (!supabaseConfigured) return { ok: false, message: "Түр боломжгүй байна" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("stock_notifications").upsert(
    { variant_id: variantId, email: email || null, phone: phone || null },
    { onConflict: email ? "variant_id,email" : "variant_id,phone" }
  );
  if (error) return { ok: false, message: "Бүртгэхэд алдаа гарлаа" };
  return {
    ok: true,
    message: "Бүртгэгдлээ! Бараа ирмэгц бид танд мэдэгдэх болно.",
  };
}
