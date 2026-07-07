export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  ratingAvg: number;
  ratingCount: number;
  isNew: boolean;
  soldCount: number;
  imageUrl: string | null;
  available: number;
}

export const BESTSELLER_MIN_SOLD = 10;
export const LIMITED_STOCK_MAX = 5;

export interface ShopParams {
  q?: string;
  categoryPath?: string;
  brands?: string[];
  min?: number;
  max?: number;
  values?: string[]; // size/colour option values
  sale?: boolean;
  featured?: boolean;
  onlyNew?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "popular" | "rating";
}

export interface ShopFilters {
  brands: { name: string; slug: string }[];
  options: { name: string; values: { value: string; hex: string | null }[] }[];
  price_min: number;
  price_max: number;
}
