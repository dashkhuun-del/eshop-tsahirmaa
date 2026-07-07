"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Globe, Link2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Share menu. Instagram has no web share endpoint, so we copy the
 * link + a suggested caption and let the person paste it into their
 * Story or DM — the standard pattern every Mongolian shop page uses.
 */
export function ShareMenu({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const shareUrl = typeof window !== "undefined" ? url : url;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} хуулагдлаа`);
    } catch {
      toast.error("Хуулж чадсангүй");
    }
    setOpen(false);
  };

  const links = [
    {
      key: "facebook",
      label: "Facebook",
      icon: Globe,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      key: "messenger",
      label: "Messenger",
      icon: MessageCircle,
      href: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
        shareUrl
      )}&redirect_uri=${encodeURIComponent(shareUrl)}&app_id=1`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={async () => {
          if (typeof navigator !== "undefined" && "share" in navigator) {
            try {
              await navigator.share({ title, url: shareUrl });
              return;
            } catch {
              /* user cancelled — fall back to menu */
            }
          }
          setOpen((o) => !o);
        }}
        aria-label="Хуваалцах"
        className="flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
      >
        <Share2 className="h-4 w-4" /> Хуваалцах
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border bg-surface p-1.5 shadow-lg"
            >
              {links.map((l) => (
                <a
                  key={l.key}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                  )}
                >
                  <l.icon className="h-4 w-4 text-accent" /> {l.label}
                </a>
              ))}
              <button
                onClick={() => copy(shareUrl, "Instagram-т буулгах холбоос")}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <Camera className="h-4 w-4 text-accent" /> Instagram-д хуулах
              </button>
              <button
                onClick={() => copy(shareUrl, "Холбоос")}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <Link2 className="h-4 w-4 text-accent" /> Холбоос хуулах
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
