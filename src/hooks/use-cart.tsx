"use client";

/**
 * Client cart store (Module 2): localStorage-backed so Add to Cart,
 * Buy Now and the header badge work immediately.
 * Module 3 swaps the internals for the DB-backed cart while keeping
 * this exact API, so no component changes.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartLine {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantTitle: string;
  price: number;
  image: string | null;
  qty: number;
}

interface CartApi {
  lines: CartLine[];
  count: number;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);
const KEY = "tb-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === line.variantId);
      if (existing)
        return prev.map((l) =>
          l.variantId === line.variantId ? { ...l, qty: l.qty + qty } : l
        );
      return [...prev, { ...line, qty }];
    });
  }, []);

  const remove = useCallback(
    (variantId: string) =>
      setLines((prev) => prev.filter((l) => l.variantId !== variantId)),
    []
  );

  const setQty = useCallback(
    (variantId: string, qty: number) =>
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => l.variantId !== variantId)
          : prev.map((l) => (l.variantId === variantId ? { ...l, qty } : l))
      ),
    []
  );

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartApi>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      add,
      remove,
      setQty,
      clear,
    }),
    [lines, add, remove, setQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
