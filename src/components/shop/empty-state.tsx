import Link from "next/link";
import { FlowerMark } from "@/components/brand/flower-mark";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel = "Дэлгүүр үзэх",
  actionHref = "/shop",
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="relative mb-6">
        <FlowerMark className="h-20 w-20 opacity-15" />
        <FlowerMark className="absolute -right-3 -top-2 h-8 w-8 opacity-30" />
        <FlowerMark className="absolute -left-4 bottom-0 h-6 w-6 opacity-20" />
      </div>
      <h2 className="font-display text-xl">{title}</h2>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      <Link href={actionHref} className="mt-6">
        <Button variant="soft">{actionLabel}</Button>
      </Link>
    </div>
  );
}
