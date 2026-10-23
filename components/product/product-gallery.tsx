"use client";

import Image from "next/image";
import * as React from "react";

import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ProductGallery({
  product,
  colorName,
}: {
  product: Product;
  colorName: string;
}) {
  const color = product.colors.find((entry) => entry.name === colorName) ?? product.colors[0];
  const [frame, setFrame] = React.useState({ colorName, index: 0 });
  const images = color?.images ?? [];
  const active = frame.colorName === colorName ? frame.index : 0;

  if (!color || images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-end rounded-xl bg-blush p-6">
        <p className="font-serif text-3xl text-foreground/70">{product.name}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-blush">
        <Image
          src={images[active] ?? images[0]}
          alt={`${product.name} in ${color.name}`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={`View image ${index + 1}`}
              aria-current={active === index}
              className={cn(
                "relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg border-2 bg-blush",
                active === index ? "border-primary" : "border-transparent",
              )}
              onClick={() => setFrame({ colorName, index })}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="72px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
