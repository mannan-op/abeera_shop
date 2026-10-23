"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/catalog/types";
import { cartItemFromProduct, useShop } from "@/lib/store/shop";
import { cn, formatPriceAmount } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const wished = isWishlisted(product.id);
  const sale = Boolean(product.compareAtPrice);
  const primary = product.colors[0];
  const image = primary?.images[0];
  const hoverImage = primary?.images[1];

  return (
    <article className="group">
      <div className="relative aspect-3/4 overflow-hidden bg-blush">
        <Link
          href={`/product/${product.slug}`}
          className={cn("absolute inset-0", product.soldOut && "opacity-50")}
        >
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                hoverImage && "[@media(hover:hover)]:group-hover:opacity-0",
              )}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <span className="flex h-full items-end p-4 font-serif text-xl text-foreground/70">{product.name}</span>
          )}
          {hoverImage ? (
            <Image
              src={hoverImage}
              alt=""
              fill
              className="object-cover opacity-0 transition duration-300 [@media(hover:hover)]:group-hover:scale-[1.03] [@media(hover:hover)]:group-hover:opacity-100"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : null}
        </Link>
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew ? <Badge tone="soft">New</Badge> : null}
          {sale ? <Badge tone="gold">Sale</Badge> : null}
          {product.soldOut ? <Badge tone="muted">Sold out</Badge> : null}
        </div>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-paper/90 text-espresso transition-colors hover:bg-paper"
          onClick={() => toggleWishlist(product.id)}
        >
          <HeartIcon className={cn("size-4", wished && "fill-espresso text-espresso")} />
        </button>
        {product.soldOut ? null : (
        <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 translate-y-1.5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          <Button
            size="sm"
            className="pointer-events-auto w-full"
            disabled={product.soldOut || !primary}
            onClick={() => {
              if (!primary) return;
              addToCart(cartItemFromProduct(product, primary.name, product.sizes[0]));
            }}
          >
            Add to bag
          </Button>
        </div>
        )}
      </div>
      <div className="px-0.5 pt-3.5">
        <Link href={`/product/${product.slug}`} className="font-serif text-[1.15rem] leading-snug font-normal">
          {product.name}
        </Link>
        <p className="mt-1 text-[0.78rem] tracking-wide text-muted-foreground">
          {sale ? (
            <>
              <span className="text-champagne">PKR {formatPriceAmount(product.price)}</span>{" "}
              <span className="line-through">{formatPriceAmount(product.compareAtPrice ?? 0)}</span>
            </>
          ) : (
            <span>PKR {formatPriceAmount(product.price)}</span>
          )}
        </p>
      </div>
    </article>
  );
}
