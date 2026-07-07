"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { Wordmark } from "@/components/brand/flower-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderSearch } from "@/components/layout/header-search";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/shop", label: "Дэлгүүр" },
  { href: "/new", label: "Шинэ ирсэн" },
  { href: "/best-sellers", label: "Эрэлттэй" },
  { href: "/sale", label: "Хямдрал", accent: true },
  { href: "/about", label: "Бидний тухай" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  // Cart state is DB-backed once Module 3 lands; API stays identical.
  const { count: cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px]">
        <div className="flex items-center gap-1 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Цэс нээх"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <Link href="/" aria-label="Цахирмаа Boutique — нүүр хуудас">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Үндсэн цэс">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "text-sm font-medium transition-colors hover:text-accent " +
                (item.accent ? "text-accent" : "text-foreground/80")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <HeaderSearch />
          <span className="hidden sm:block">
            <ThemeToggle />
          </span>
          <Link href="/wishlist" className="hidden sm:block">
            <Button variant="ghost" size="icon" aria-label="Хадгалсан">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="icon" aria-label="Нэвтрэх">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Сагс">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-background p-6 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              aria-label="Гар утасны цэс"
            >
              <div className="mb-8 flex items-center justify-between">
                <Wordmark />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Цэс хаах"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1" aria-label="Гар утасны цэс">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      "rounded-lg px-3 py-3 font-display text-lg transition-colors hover:bg-muted " +
                      (item.accent ? "text-accent" : "")
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex items-center justify-between border-t pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <User className="h-4 w-4" /> Нэвтрэх / Бүртгүүлэх
                </Link>
                <ThemeToggle />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
