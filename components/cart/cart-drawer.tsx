"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/utils";
import { itemKey, useShop } from "@/lib/store/shop";

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartSubtotal,
    updateQty,
    removeFromCart,
    saveForLater,
    saved,
    moveToCart,
  } = useShop();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-[min(100%,28rem)]">
        <div className="border-b border-border px-6 py-5">
          <SheetTitle>Your bag</SheetTitle>
        </div>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center px-6">
            <p className="font-serif text-2xl">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The Eid edit and new arrivals are waiting in the shop.
            </p>
            <Button asChild className="mt-8">
              <Link href="/shop" onClick={() => setCartOpen(false)}>
                Continue shopping
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {cart.map((item) => {
                const key = itemKey(item);
                return (
                  <li key={key} className="flex gap-4 border-b border-border py-4">
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative size-24 shrink-0 overflow-hidden"
                      onClick={() => setCartOpen(false)}
                    >
                      <Image src={item.image} alt="" fill className="object-cover" sizes="96px" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.color} · {item.size}
                      </p>
                      <p className="mt-2 text-sm">{formatPrice(item.price)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-8 items-center border border-border">
                          <button
                            type="button"
                            className="px-2"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(key, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            className="px-2"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(key, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="kicker text-muted-foreground hover:text-foreground"
                          onClick={() => saveForLater(key)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="kicker text-muted-foreground hover:text-foreground"
                          onClick={() => removeFromCart(key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {saved.length > 0 ? (
              <div className="border-t border-border px-6 py-4">
                <p className="kicker">Saved for later</p>
                {saved.map((item) => (
                  <div key={itemKey(item)} className="mt-2 flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <button
                      type="button"
                      className="kicker"
                      onClick={() => moveToCart(itemKey(item))}
                    >
                      Move to bag
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="border-t border-border px-6 py-5">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Shipping and tax calculated at checkout.
              </p>
              <Button asChild className="mt-5 w-full">
                <Link href="/checkout" onClick={() => setCartOpen(false)}>
                  Checkout
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href="/cart" onClick={() => setCartOpen(false)}>
                  View bag
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
