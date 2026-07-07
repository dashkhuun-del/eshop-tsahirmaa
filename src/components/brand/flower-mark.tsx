import { cn } from "@/lib/utils";

/**
 * Цахирмаа цэцэг — minimal six-petal line mark.
 * The single signature element of the brand: used in the logo,
 * as a section divider, and on the invoice/PWA icon.
 */
export function FlowerMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8 text-accent", className)}
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="24"
            cy="13.5"
            rx="4.5"
            ry="10"
            transform={`rotate(${deg} 24 24)`}
          />
        ))}
        <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <FlowerMark className="h-7 w-7" />
      <span className="font-display text-xl leading-none tracking-wide">
        Цахирмаа
        <span className="ml-1.5 align-middle text-[0.62em] font-sans font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Boutique
        </span>
      </span>
    </span>
  );
}
