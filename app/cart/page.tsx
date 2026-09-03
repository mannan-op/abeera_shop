"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { itemKey, useShop } from "@/lib/store/shop";

export default function CartPage() {
  const { cart, saved, cartSubtotal, updateQty, removeFromCart, saveForLater, moveToCart } =
    useShop();

  if (cart.length === 0 && saved.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-serif text-4xl">Your bag is empty</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The new arrivals have just been steamed.
        </p>
        <Button asChild className="mt-8">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  const shipping = cartSubtotal >= 40000 ? 0 : 1800;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-12 md:grid-cols-[1fr_22rem] md:px-10 md:py-16">
      <div>
        <h1 className="font-serif text-5xl">Bag</h1>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {cart.map((item) => {
            const key = itemKey(item);
            return (
              <li key={key} className="flex gap-4 py-6">
                <Link href={`/product/${item.slug}`} className="relative size-28 shrink-0 overflow-hidden">
                  <Image src={item.image} alt="" fill className="object-cover" sizes="112px" />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <Link href={`/product/${item.slug}`}>{item.name}</Link>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.color} · {item.size}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex h-10 items-center rounded-full border border-border bg-card">
                      <button type="button" className="px-3" onClick={() => updateQty(key, item.quantity - 1)}>
                        −
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button type="button" className="px-3" onClick={() => updateQty(key, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <button type="button" className="kicker" onClick={() => saveForLater(key)}>
                      Save for later
                    </button>
                    <button type="button" className="kicker" onClick={() => removeFromCart(key)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {saved.length > 0 ? (
          <div className="mt-12">
            <h2 className="font-serif text-2xl">Saved for later</h2>
            {saved.map((item) => (
              <div key={itemKey(item)} className="mt-4 flex items-center justify-between border-b border-border py-4">
                <span>{item.name}</span>
                <button type="button" className="kicker" onClick={() => moveToCart(itemKey(item))}>
                  Move to bag
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <aside className="h-fit rounded-2xl bg-card p-8">
        <h2 className="kicker">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(cartSubtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Estimated shipping</dt>
            <dd>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">Add a code at checkout.</p>
        <Button asChild className="mt-6 w-full" disabled={cart.length === 0}>
          <Link href="/checkout">Checkout</Link>
        </Button>
        <Button asChild variant="outline" className="mt-2 w-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </aside>
    </div>
  );
}
