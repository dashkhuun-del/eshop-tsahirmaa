import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 1290000 → "1,290,000₮" */
export function formatPrice(amount: number) {
  return `${new Intl.NumberFormat("mn-MN").format(amount)}₮`;
}
