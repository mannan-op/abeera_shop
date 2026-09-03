"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon } from "lucide-react";
import * as React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductGallery } from "@/components/product/product-gallery";
import type { Product } from "@/lib/catalog/types";
import { cartItemFromProduct, useShop } from "@/lib/store/shop";
import { cn, formatPrice } from "@/lib/utils";

export function ProductPurchase({ product }: { product: Product }) {
  const [color, setColor] = React.useState(product.colors[0].name);
  const [size, setSize] = React.useState(product.sizes[0]);
  const [qty, setQty] = React.useState(1);
  const { addToCart, toggleWishlist, isWishlisted, rememberView } = useShop();
  const router = useRouter();
  const wished = isWishlisted(product.id);

  React.useEffect(() => {
    rememberView(product.id);
  }, [product.id, rememberView]);

  function add() {
    addToCart({ ...cartItemFromProduct(product, color, size), quantity: qty });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <ProductGallery product={product} colorName={color} />
      <div>
        <p className="kicker">{product.category}</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{product.name}</h1>
        <p className="mt-4 text-lg">
          {product.compareAtPrice ? (
            <>
              <span className="text-gold">{formatPrice(product.price)}</span>{" "}
              <span className="text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            </>
          ) : (
            formatPrice(product.price)
          )}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {product.rating.toFixed(1)} · {product.reviewCount} reviews
        </p>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        <fieldset className="mt-8">
          <legend className="kicker">Colour — {color}</legend>
          <div className="mt-3 flex gap-2">
            {product.colors.map((entry) => (
              <button
                key={entry.name}
                type="button"
                aria-label={entry.name}
                aria-pressed={color === entry.name}
                className={cn(
                  "size-8 rounded-full border-2",
                  color === entry.name ? "border-primary" : "border-transparent ring-1 ring-border",
                )}
                style={{ background: entry.hex }}
                onClick={() => setColor(entry.name)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <div className="flex items-center justify-between">
            <legend className="kicker">Size</legend>
            <Dialog>
              <DialogTrigger className="kicker text-muted-foreground hover:text-foreground">
                Size guide
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Size guide</DialogTitle>
                <DialogDescription>
                  Measurements are of the garment, in centimetres. If you are between sizes, take the smaller for structured pieces and the larger for linen and silk.
                </DialogDescription>
                <table className="mt-4 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2">Size</th>
                      <th>Bust</th>
                      <th>Waist</th>
                      <th>Hip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["XS", "80", "62", "86"],
                      ["S", "84", "66", "90"],
                      ["M", "88", "70", "94"],
                      ["L", "94", "76", "100"],
                      ["XL", "100", "82", "106"],
                    ].map((row) => (
                      <tr key={row[0]} className="border-b border-border">
                        {row.map((cell) => (
                          <td key={cell} className="py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((entry) => (
              <button
                key={entry}
                type="button"
                className={cn(
                  "min-h-11 min-w-11 rounded-full border px-3 text-xs",
                  size === entry
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
                onClick={() => setSize(entry)}
              >
                {entry}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-12 items-center rounded-full border border-border bg-card">
            <button type="button" className="px-3" aria-label="Decrease" onClick={() => setQty((value) => Math.max(1, value - 1))}>
              −
            </button>
            <span className="w-8 text-center">{qty}</span>
            <button type="button" className="px-3" aria-label="Increase" onClick={() => setQty((value) => value + 1)}>
              +
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" disabled={product.soldOut} onClick={add}>
            {product.soldOut ? "Sold out" : "Add to bag"}
          </Button>
          <Button
            variant="gold"
            className="flex-1"
            disabled={product.soldOut}
            onClick={() => {
              add();
              router.push("/checkout");
            }}
          >
            Buy now
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Wishlist"
            aria-pressed={wished}
            onClick={() => toggleWishlist(product.id)}
          >
            <HeartIcon className={cn("size-4", wished && "fill-current")} />
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Complimentary shipping over $400. Easy returns within 30 days.{" "}
          <Link href="/shipping" className="underline underline-offset-4">
            Shipping
          </Link>{" "}
          ·{" "}
          <Link href="/returns" className="underline underline-offset-4">
            Returns
          </Link>
        </p>

        <Accordion type="single" collapsible className="mt-10">
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>{product.details}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="materials">
            <AccordionTrigger>Materials</AccordionTrigger>
            <AccordionContent>{product.materials}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger>Care</AccordionTrigger>
            <AccordionContent>{product.care}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
