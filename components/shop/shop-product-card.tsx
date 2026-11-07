"use client";

import { HeartIcon, ShoppingBagIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/catalog/types";
import { useShop } from "@/lib/store/shop";
import { cn, formatPriceAmount } from "@/lib/utils";

const showOnTouch = "[@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100";

export function ShopProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { toggleWishlist, isWishlisted } = useShop();
  const wished = isWishlisted(product.id);
  const images = product.colors[0]?.images ?? [];
  const image = images[0];
  const hoverImage = images[1] && images[1] !== image ? images[1] : undefined;
  const compare = product.compareAtPrice ?? 0;
  const off = compare > product.price ? Math.round((1 - product.price / compare) * 100) : 0;
  const href = `/product/${product.slug}`;
  const sizes = "(min-width: 1024px) 25vw, 50vw";

  return (
    <article className="group">
      <div className="relative aspect-[2/3] overflow-hidden bg-[#efe7db]">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes={sizes}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              className={cn(
                "object-cover transition duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.04]",
                hoverImage && "[@media(hover:hover)]:group-hover:opacity-0",
                product.soldOut && "opacity-60",
              )}
            />
          ) : null}
          {hoverImage ? (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.04] [@media(hover:hover)]:group-hover:opacity-100"
            />
          ) : null}
        </Link>

        {off > 0 ? (
          <span className="pointer-events-none absolute top-2.5 left-2.5 grid size-11 place-items-center rounded-full bg-[#2b211c]/55 text-[11px] text-white">
            -{off}%
          </span>
        ) : product.soldOut ? (
          <span className="pointer-events-none absolute top-3 left-3 bg-white px-2 py-1 text-[10px] tracking-[0.14em] uppercase">Sold out</span>
        ) : product.isNew ? (
          <span className="pointer-events-none absolute top-3 left-3 bg-white px-2 py-1 text-[10px] tracking-[0.14em] uppercase">New</span>
        ) : null}

        <button
          type="button"
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wished}
          onClick={() => toggleWishlist(product.id)}
          className={cn(
            "absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-white text-[#2b211c] shadow-sm transition duration-300 hover:scale-105 focus-visible:opacity-100",
            wished ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            showOnTouch,
          )}
        >
          <HeartIcon className={cn("size-4", wished && "fill-[#2b211c]")} />
        </button>

        <Link
          href={href}
          className={cn(
            "absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-[#fdfbf7]/85 py-3 text-[13px] tracking-[0.03em] text-[#2b211c] backdrop-blur-sm transition duration-300 group-hover:translate-y-0 focus-visible:translate-y-0 md:text-[14px]",
            showOnTouch,
          )}
        >
          <ShoppingBagIcon className="size-4" aria-hidden />
          {product.soldOut ? "View piece" : "Select size"}
        </Link>
      </div>

      <div className="pt-3">
        <Link href={href} className="block text-[14px] leading-snug text-[#2b211c] underline-offset-4 hover:underline md:text-[14.5px]">
          {product.name}
        </Link>
        <p className="mt-1 text-[12.5px] font-semibold tracking-[0.01em] text-[#2b211c]">
          {off > 0 ? (
            <>
              <span className="mr-1.5 text-[10px] font-medium tracking-[0.14em] text-[#8b3a2e] uppercase">Sale</span>
              <s className="mr-1.5 font-normal text-muted-foreground">Rs.{formatPriceAmount(compare)}</s>
              <span className="text-[#8b3a2e]">Rs.{formatPriceAmount(product.price)}</span>
            </>
          ) : (
            <>Rs.{formatPriceAmount(product.price)}</>
          )}
        </p>
      </div>
    </article>
  );
}
