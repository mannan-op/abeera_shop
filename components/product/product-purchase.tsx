"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BanknoteIcon, HeartIcon, RefreshCcwIcon, ShoppingBagIcon, TruckIcon } from "lucide-react";
import * as React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductGallery } from "@/components/product/product-gallery";
import type { Product } from "@/lib/catalog/types";
import { cartItemFromProduct, useShop } from "@/lib/store/shop";
import { cn, formatPrice, formatPriceAmount } from "@/lib/utils";

function WhatsAppMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 20.5 3.5zM12 20.4a9 9 0 0 1-4.6-1.3l-.3-.2-3.1.8.8-3-.2-.3A9 9 0 1 1 12 20.4zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.2-.7.9-.9 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8 8 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.2-.4a.5.5 0 0 0 0-.4c-.1-.1-.6-1.5-.8-2s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 12 12 0 0 0 4.5 4c.6.2 1 .4 1.5.5a3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.3z" />
    </svg>
  );
}

function whatsAppHref(productName: string) {
  const digits = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const text = `Hello Abeera, I need help with ${productName}.`;
  if (!digits) return "/contact";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function ProductPurchase({ product }: { product: Product }) {
  const [color, setColor] = React.useState(product.colors[0]?.name ?? "");
  const [size, setSize] = React.useState(product.sizes[0] ?? "");
  const [qty, setQty] = React.useState(1);
  const { addToCart, toggleWishlist, isWishlisted, rememberView } = useShop();
  const router = useRouter();
  const wished = isWishlisted(product.id);
  const helpHref = whatsAppHref(product.name);
  const externalHelp = helpHref.startsWith("http");

  React.useEffect(() => {
    rememberView(product.id);
  }, [product.id, rememberView]);

  function add() {
    if (!color || !size) return;
    addToCart({ ...cartItemFromProduct(product, color, size), quantity: qty });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <ProductGallery product={product} colorName={color} />
        <div className="mt-6 flex items-start gap-3 text-gold-ink">
          <TruckIcon className="mt-1 size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-serif text-xl text-foreground">Lahore Heritage. Pakistani Pride.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Festive lawn, chiffon, and formal pret finished for celebrations at home.
            </p>
          </div>
        </div>
      </div>
      <div>
        <p className="kicker">{product.isNew ? "New arrival" : product.category.replace(/-/g, " ")}</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] md:text-5xl">{product.name}</h1>
        <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm tracking-[0.08em] text-foreground">PKR</span>
          <span className="font-serif text-4xl leading-none text-primary">{formatPriceAmount(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
          ) : null}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {product.rating.toFixed(1)} · {product.reviewCount} reviews
        </p>
        <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        {product.colors.length > 0 ? (
          <fieldset className="mt-8">
            <legend className="text-[12px] font-medium tracking-[0.14em] text-foreground uppercase">
              Colour — {color}
            </legend>
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
        ) : null}

        {product.sizes.length > 0 ? (
          <fieldset className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <legend className="text-[12px] font-medium tracking-[0.14em] text-foreground uppercase">
                Select size
              </legend>
              <Dialog>
                <DialogTrigger className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Size guide
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Size guide</DialogTitle>
                  <DialogDescription>
                    Garment measurements in centimetres. Between sizes, take the smaller for structured formals and the larger for lawn and chiffon.
                  </DialogDescription>
                  <table className="mt-4 w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 font-medium">Size</th>
                        <th className="font-medium">Bust</th>
                        <th className="font-medium">Waist</th>
                        <th className="font-medium">Hip</th>
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
                  aria-pressed={size === entry}
                  className={cn(
                    "flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm",
                    size === entry
                      ? "border-espresso bg-espresso text-paper"
                      : "border-border bg-card text-foreground hover:border-foreground/30",
                  )}
                  onClick={() => setSize(entry)}
                >
                  {entry}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-11 items-center rounded-md border border-border bg-card">
            <button
              type="button"
              className="flex size-11 items-center justify-center"
              aria-label="Decrease quantity"
              onClick={() => setQty((value) => Math.max(1, value - 1))}
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button
              type="button"
              className="flex size-11 items-center justify-center"
              aria-label="Increase quantity"
              onClick={() => setQty((value) => value + 1)}
            >
              +
            </button>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            onClick={() => toggleWishlist(product.id)}
          >
            <HeartIcon className={cn("size-4", wished && "fill-current")} />
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button className="w-full tracking-[0.18em]" disabled={product.soldOut || !color || !size} onClick={add}>
            {product.soldOut ? "Sold out" : "Add to bag"}
            {product.soldOut ? null : <ShoppingBagIcon className="size-4" />}
          </Button>
          <Button asChild variant="outline" className="w-full tracking-[0.12em]">
            <Link
              href={helpHref}
              target={externalHelp ? "_blank" : undefined}
              rel={externalHelp ? "noreferrer" : undefined}
            >
              <WhatsAppMark className="size-4" />
              Need help? Chat on WhatsApp
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full normal-case tracking-normal"
            disabled={product.soldOut || !color || !size}
            onClick={() => {
              add();
              router.push("/checkout");
            }}
          >
            Buy now
          </Button>
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gold-ink">
          <li className="inline-flex items-center gap-1.5">
            <TruckIcon className="size-4" aria-hidden />
            <Link href="/shipping" className="text-foreground underline-offset-4 hover:underline">
              Free delivery
            </Link>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <RefreshCcwIcon className="size-4" aria-hidden />
            <Link href="/returns" className="text-foreground underline-offset-4 hover:underline">
              Easy exchange
            </Link>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <BanknoteIcon className="size-4" aria-hidden />
            <span>COD available</span>
          </li>
        </ul>

        <Accordion type="single" collapsible className="mt-8">
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
