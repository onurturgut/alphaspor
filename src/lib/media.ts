import media from "@/data/r2-media.json";

/** Public asset addresses only; this module is safe for client components. */
export function mediaUrl(path: string): string {
  return (media as Record<string, string>)[path] ?? path;
}
