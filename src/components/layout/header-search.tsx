"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
    setQ("");
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Хайлт хаах" : "Хайх"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: -8, width: 0 }}
              animate={{ opacity: 1, y: 0, width: 260 }}
              exit={{ opacity: 0, y: -8, width: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full z-50 mt-2 overflow-hidden rounded-full border bg-surface shadow-lg"
            >
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Юу хайж байна?"
                aria-label="Бүтээгдэхүүн хайх"
                className="h-11 w-full bg-transparent px-4 text-sm focus:outline-none"
              />
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
