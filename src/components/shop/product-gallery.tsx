"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cld } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { FlowerMark } from "@/components/brand/flower-mark";

export interface GalleryImage {
  url: string;
  alt: string | null;
}

export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const count = images.length;

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + count) % Math.max(count, 1));

  if (!count) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-muted">
        <FlowerMark className="h-16 w-16 opacity-20" />
      </div>
    );
  }

  return (
    <div>
      {/* Main image — swipeable */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={index}
            className="absolute inset-0 cursor-zoom-in"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            onClick={() => setLightbox(true)}
          >
            <Image
              src={cld(images[index].url, 1000)!}
              alt={images[index].alt ?? `${name} — зураг ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="select-none object-cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setLightbox(true)}
          aria-label="Зураг томруулах"
          className="absolute bottom-3 right-3 rounded-full bg-surface/90 p-2.5 shadow-md backdrop-blur"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Өmnөх зураг"
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-surface/90 p-2 shadow-md sm:block"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Дараагийн зураг"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-surface/90 p-2 shadow-md sm:block"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-surface/70 transition-all",
                    i === index && "w-4 bg-accent"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Зураг ${i + 1}`}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === index ? "border-accent" : "border-transparent"
              )}
            >
              <Image
                src={cld(img.url, 160)!}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setLightbox(false);
              setZoomed(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Зураг томруулж үзэх"
          >
            <button
              className="absolute right-4 top-4 rounded-full bg-surface/20 p-2 text-background"
              aria-label="Хаах"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              className={cn(
                "relative h-[80vh] w-full max-w-3xl",
                zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              )}
              drag={count > 1 && !zoomed ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
              animate={{ scale: zoomed ? 1.8 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={cld(images[index].url, 1600)!}
                alt={images[index].alt ?? name}
                fill
                sizes="100vw"
                className="select-none object-contain"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
