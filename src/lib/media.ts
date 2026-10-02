import media from "@/data/r2-media.json";

const mediaOrigins = new Set(Object.values(media).map((url) => new URL(url).origin));

/** Keep previously saved admin uploads usable when r2.dev is unreachable. */
export function uploadedImageUrl(path: string): string {
  try {
    const url = new URL(path);
    if (mediaOrigins.has(url.origin) && /^\/media\/admin\/[a-f0-9-]{36}\.(webp|jpg|png|avif)$/.test(url.pathname)) {
      return `/api/media${url.pathname}`;
    }
  } catch { /* Relative and external media addresses are preserved. */ }
  return path;
}

/** Public asset addresses only; this module is safe for client components. */
export function mediaUrl(path: string): string {
  return uploadedImageUrl((media as Record<string, string>)[path] ?? path);
}
