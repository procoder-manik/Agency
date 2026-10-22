/** Image/media field values are either a URL string or { url, alt } picked from the media library. */
export type MediaValue = string | { url: string; alt?: string } | null | undefined;
export const mediaUrl = (v: MediaValue) => (typeof v === "string" ? v : v?.url || "");
export const mediaAlt = (v: MediaValue, fallback = "") => (typeof v === "object" && v?.alt) || fallback;
export function mediaKind(url: string): "image" | "video" | "lottie" | "youtube" | "none" {
  if (!url) return "none";
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  const u = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov)$/.test(u) || /[?&]kind=video/.test(url)) return "video";
  if (/\.json$/.test(u) || /\.lottie$/.test(u)) return "lottie";
  return "image";
}
