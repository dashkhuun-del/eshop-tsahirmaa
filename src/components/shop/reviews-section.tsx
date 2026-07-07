import { Star } from "lucide-react";
import Image from "next/image";
import { cld } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author: { full_name: string | null } | { full_name: string | null }[] | null;
  images: { url: string }[];
}

function authorName(a: ReviewData["author"]) {
  const one = Array.isArray(a) ? a[0] : a;
  return one?.full_name || "Үйлчлүүлэгч";
}

export function ReviewsSection({
  reviews,
  ratingAvg,
  ratingCount,
}: {
  reviews: ReviewData[];
  ratingAvg: number;
  ratingCount: number;
}) {
  const counts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );
  const max = Math.max(1, ...counts);

  return (
    <section id="reviews" className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h2 className="font-display mb-8 text-2xl">Үнэлгээ, сэтгэгдэл</h2>

      <div className="mb-10 grid gap-8 sm:grid-cols-[auto_1fr]">
        <div className="text-center sm:text-left">
          <p className="font-display text-5xl">{ratingAvg.toFixed(1)}</p>
          <div className="mt-1 flex justify-center gap-0.5 sm:justify-start">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i <= Math.round(ratingAvg)
                    ? "fill-current text-accent"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {ratingCount} үнэлгээ
          </p>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          {[5, 4, 3, 2, 1].map((star, i) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground">{star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(counts[i] / max) * 100}%` }}
                />
              </div>
              <span className="w-5 text-right text-muted-foreground">{counts[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Одоогоор сэтгэгдэл алга. Эхний сэтгэгдлийг та үлдээгээрэй!
        </p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b pb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{authorName(r.author)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("mn-MN")}
                </p>
              </div>
              <div className="mt-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i <= r.rating
                        ? "fill-current text-accent"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              {r.comment && (
                <p className="mt-2 text-sm leading-relaxed">{r.comment}</p>
              )}
              {r.images.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {r.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative h-16 w-16 overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={cld(img.url, 200)!}
                        alt="Хэрэглэгчийн зураг"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
