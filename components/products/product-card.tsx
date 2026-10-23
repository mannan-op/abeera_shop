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
    <article className="group overflow-hidden rounded-xl bg-card ring-1 ring-border/80">
      <div className="relative aspect-[3/4] overflow-hidden bg-blush">
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
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
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : null}
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew ? <Badge tone="soft">New</Badge> : null}
          {sale ? <Badge tone="gold">Sale</Badge> : null}
          {product.soldOut ? <Badge tone="muted">Sold out</Badge> : null}
        </div>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition-colors hover:bg-card"
          onClick={() => toggleWishlist(product.id)}
        >
          <HeartIcon className={cn("size-4", wished && "fill-primary text-primary")} />
        </button>
        <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden opacity-0 transition-opacity md:block md:group-hover:opacity-100">
          <Button
            size="sm"
            className="pointer-events-auto w-full"
            disabled={product.soldOut || !primary}
            onClick={() => {
              if (!primary) return;
              addToCart(cartItemFromProduct(product, primary.name, product.sizes[0]));
            }}
          >
            {product.soldOut ? "Sold out" : "Quick add"}
          </Button>
        </div>
      </div>
      <div className="px-3 py-3.5 md:px-4 md:py-4">
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm leading-snug text-foreground">
          {product.name}
        </Link>
        <p className="mt-1.5 text-sm">
          {sale ? (
            <>
              <span className="font-medium text-primary">PKR {formatPriceAmount(product.price)}</span>{" "}
              <span className="text-muted-foreground line-through">
                {formatPriceAmount(product.compareAtPrice ?? 0)}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">PKR {formatPriceAmount(product.price)}</span>
          )}
        </p>
      </div>
    </article>
  );
}
