"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopFilters } from "@/types/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SORTS = [
  { value: "newest", label: "Шинэ эхэндээ" },
  { value: "popular", label: "Эрэлттэй" },
  { value: "price_asc", label: "Үнэ: багаас их" },
  { value: "price_desc", label: "Үнэ: ихээс бага" },
  { value: "rating", label: "Үнэлгээ өндөр" },
];

export function FilterBar({ filters }: { filters: ShopFilters }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const toggleCsv = (key: string, value: string) => {
    const current = sp.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    set(key, next.length ? next.join(",") : null);
  };

  const activeCount =
    (sp.get("brand")?.split(",").filter(Boolean).length ?? 0) +
    (sp.get("values")?.split(",").filter(Boolean).length ?? 0) +
    (sp.get("min") ? 1 : 0) +
    (sp.get("max") ? 1 : 0);

  const panel = (
    <FilterPanel filters={filters} sp={sp} toggleCsv={toggleCsv} set={set} />
  );

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" /> Шүүлтүүр
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-[10px] text-accent-foreground">
              {activeCount}
            </span>
          )}
        </Button>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">Эрэмбэлэх:</span>
          <select
            value={sp.get("sort") ?? "newest"}
            onChange={(e) => set("sort", e.target.value)}
            className="h-9 rounded-lg border bg-surface px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Desktop sidebar content is rendered by parent via <aside>; expose panel */}
      <div className="hidden lg:block">{panel}</div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-foreground/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[70] max-h-[80vh] overflow-y-auto rounded-t-2xl border-t bg-background p-5 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              role="dialog"
              aria-label="Шүүлтүүр"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-lg">Шүүлтүүр</p>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Хаах"
                  className="rounded-full p-1.5 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {panel}
              <Button className="mt-6 w-full" onClick={() => setSheetOpen(false)}>
                Үр дүн харах
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterPanel({
  filters,
  sp,
  toggleCsv,
  set,
}: {
  filters: ShopFilters;
  sp: URLSearchParams;
  toggleCsv: (key: string, value: string) => void;
  set: (key: string, value: string | null) => void;
}) {
  const brandActive = sp.get("brand")?.split(",") ?? [];
  const valuesActive = sp.get("values")?.split(",") ?? [];

  return (
    <div className="space-y-7">
      {filters.brands.length > 0 && (
        <section>
          <p className="eyebrow mb-3">Брэнд</p>
          <div className="space-y-2">
            {filters.brands.map((b) => (
              <label key={b.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={brandActive.includes(b.slug)}
                  onChange={() => toggleCsv("brand", b.slug)}
                  className="h-4 w-4 rounded accent-[var(--accent)]"
                />
                {b.name}
              </label>
            ))}
          </div>
        </section>
      )}

      {filters.options.map((o) => (
        <section key={o.name}>
          <p className="eyebrow mb-3">{o.name}</p>
          <div className="flex flex-wrap gap-2">
            {o.values.map((v) => {
              const active = valuesActive.includes(v.value);
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => toggleCsv("values", v.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex min-w-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "hover:border-accent"
                  )}
                >
                  {v.hex && (
                    <span
                      className="h-3 w-3 rounded-full border"
                      style={{ background: v.hex }}
                    />
                  )}
                  {v.value}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <section>
        <p className="eyebrow mb-3">Үнэ (₮)</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={String(filters.price_min || 0)}
            defaultValue={sp.get("min") ?? ""}
            onBlur={(e) => set("min", e.target.value || null)}
            aria-label="Доод үнэ"
            className="h-9"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={String(filters.price_max || 0)}
            defaultValue={sp.get("max") ?? ""}
            onBlur={(e) => set("max", e.target.value || null)}
            aria-label="Дээд үнэ"
            className="h-9"
          />
        </div>
      </section>

      {(brandActive.length > 0 || valuesActive.length > 0 || sp.get("min") || sp.get("max")) && (
        <button
          onClick={() => {
            set("brand", null);
            set("values", null);
            set("min", null);
            set("max", null);
          }}
          className="text-sm text-accent underline underline-offset-4"
        >
          Шүүлтүүр арилгах
        </button>
      )}
    </div>
  );
}
