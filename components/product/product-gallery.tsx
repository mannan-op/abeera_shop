"use client";

import Image from "next/image";
import * as React from "react";

import type { Product } from "@/lib/catalog/types";

export function ProductGallery({
  product,
  colorName,
}: {
  product: Product;
  colorName: string;
}) {
  const color = product.colors.find((entry) => entry.name === colorName) ?? product.colors[0];
  const [active, setActive] = React.useState(0);
  const images = color.images;

  React.useEffect(() => {
    setActive(0);
  }, [colorName]);

  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr]">
      <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            aria-label={`View image ${index + 1}`}
            className={`relative size-16 shrink-0 overflow-hidden border ${
              active === index ? "border-primary" : "border-transparent"
            }`}
            onClick={() => setActive(index)}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>
      <div className="relative order-1 aspect-3/4 overflow-hidden bg-muted md:order-2">
        <Image
          src={images[active]}
          alt={`${product.name} in ${color.name}`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
