import Image from "next/image";

import { cn } from "@/lib/utils";

const OPTIMIZED_HOSTS = new Set(["images.unsplash.com", "res.cloudinary.com"]);

function canOptimize(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Homepage images come from the CMS as URL strings. Next.js optimizes the
 * hosts we allow; any other public URL still renders.
 */
export function CmsImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return null;

  if (canOptimize(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("absolute inset-0 size-full", className)} />
  );
}
