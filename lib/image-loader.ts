type LoaderArgs = { src: string; width: number; quality?: number };

/**
 * Unsplash already resizes on its CDN, so ask it for the exact width instead of
 * routing through the Next optimizer. Upstream fetches from the optimizer were
 * timing out on slow connections and returning 500s (broken product images).
 */
export default function imageLoader({ src, width, quality }: LoaderArgs) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    if (!url.searchParams.has("auto") && !url.searchParams.has("fm")) url.searchParams.set("auto", "format");
    if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");
    return url.toString();
  }
  if (src.startsWith("https://res.cloudinary.com/") && src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/w_${width},c_limit,q_${quality ?? "auto"},f_auto/`);
  }
  const joiner = src.includes("?") ? "&" : "?";
  return `${src}${joiner}w=${width}`;
}
