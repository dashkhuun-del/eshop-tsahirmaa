import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/types/catalog";
import { BESTSELLER_MIN_SOLD, LIMITED_STOCK_MAX } from "@/types/catalog";

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProductBadges({ p }: { p: ProductCardData }) {
  const badges: React.ReactNode[] = [];
  if (p.available === 0)
    badges.push(
      <Badge key="out" className="bg-foreground/70 text-background">Дууссан</Badge>
    );
  else if (p.available <= LIMITED_STOCK_MAX)
    badges.push(
      <Badge key="ltd" className="bg-danger text-white">
        Цөөн үлдсэн
      </Badge>
    );
  if (p.salePrice !== null && p.salePrice < p.basePrice)
    badges.push(
      <Badge key="sale" className="bg-accent text-accent-foreground">
        −{Math.round((1 - p.salePrice / p.basePrice) * 100)}%
      </Badge>
    );
  if (p.soldCount >= BESTSELLER_MIN_SOLD)
    badges.push(
      <Badge key="best" className="bg-foreground text-background">Эрэлттэй</Badge>
    );
  if (p.isNew && badges.length < 2)
    badges.push(
      <Badge key="new" className="bg-surface text-foreground shadow-sm">Шинэ</Badge>
    );
  if (!badges.length) return null;
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
      {badges.slice(0, 2)}
    </div>
  );
}
