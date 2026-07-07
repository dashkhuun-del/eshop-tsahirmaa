/**
 * Cloudinary URL helper: automatic format (WebP/AVIF), automatic
 * quality compression, on-the-fly resizing.
 */
export function cld(url: string | null | undefined, width = 600): string | null {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
}
