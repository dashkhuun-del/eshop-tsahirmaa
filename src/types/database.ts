/**
 * Core entity types (hand-maintained for Modules 1–2).
 * After connecting your Supabase project, generate the full types with:
 *   npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
 */

export type UserRole = "customer" | "manager" | "admin";
export type OrderStatus =
  | "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  points_balance: number;
  created_at: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  path: string;
  depth: number;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  brand_id: string | null;
  sku: string | null;
  base_price: number;
  sale_price: number | null;
  is_new: boolean;
  is_featured: boolean;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  price_override: number | null;
  is_active: boolean;
}
