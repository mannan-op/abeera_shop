"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/catalog/types";
import { cartItemFromProduct, useShop } from "@/lib/store/shop";
import { cn, formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const wished = isWishlisted(product.id);
  const sale = Boolean(product.compareAtPrice);

  return (
    <article className="group">
      <div className="relative aspect-3/4 overflow-hidden bg-muted">
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          <Image
            src={product.colors[0].images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <Image
            src={product.colors[0].images[1]}
            alt=""
            fill
            className="object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#14110e]/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew ? <Badge>New</Badge> : null}
          {sale ? <Badge tone="gold">Sale</Badge> : null}
          {product.soldOut ? <Badge tone="muted">Sold out</Badge> : null}
        </div>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-ivory/90 text-primary backdrop-blur-sm transition-colors hover:bg-ivory"
          onClick={() => toggleWishlist(product.id)}
        >
          <HeartIcon className={cn("size-4", wished && "fill-current")} />
        </button>
        <div className="pointer-events-none absolute inset-x-4 bottom-4 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <Button
            size="sm"
            variant="light"
            className="pointer-events-auto w-full"
            disabled={product.soldOut}
            onClick={() =>
              addToCart(
                cartItemFromProduct(product, product.colors[0].name, product.sizes[0]),
              )
            }
          >
            {product.soldOut ? "Sold out" : "Quick add"}
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Link href={`/product/${product.slug}`} className="font-serif text-lg leading-snug">
          {product.name}
        </Link>
        <p className="mt-1.5 text-sm">
          {sale ? (
            <>
              <span className="text-gold">{formatPrice(product.price)}</span>{" "}
              <span className="text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice ?? 0)}
              </span>
            </>
          ) : (
            formatPrice(product.price)
          )}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{product.rating.toFixed(1)} · {product.reviewCount}</p>
      </div>
    </article>
  );
}
