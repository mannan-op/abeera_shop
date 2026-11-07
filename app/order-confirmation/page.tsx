import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { lastPlacedOrder } from "@/lib/checkout/actions";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: number } = await searchParams;
  const found = number ? await lastPlacedOrder(number) : null;

  if (!found) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-serif text-4xl">No order to show</h1>
        <p className="mt-4 text-sm text-muted-foreground">Look up any order with its number and the email you used at checkout.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Button asChild>
            <Link href={number ? `/track-order?order=${encodeURIComponent(number)}` : "/track-order"}>Track an order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { order, email } = found;
  const delivery = order.shippingMethod === "express" ? "1–2 working days" : "4–5 working days";

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center md:py-28">
      <p className="kicker">Thank you</p>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">Your order is confirmed</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Order <strong className="font-medium text-foreground">{order.orderNumber}</strong>. Your order slip is on its way to {email}.
      </p>
      <dl className="mt-10 space-y-2 text-left text-sm">
        <div className="flex justify-between">
          <dt>Delivering to</dt>
          <dd>{order.city}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd>{delivery}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Payment</dt>
          <dd>{order.paymentMethod === "COD" ? "Cash on delivery" : (order.paymentMethod ?? "—")}</dd>
        </div>
        {order.discount > 0 ? (
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>−{formatPrice(order.discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>
      <ul className="mt-8 space-y-2 border-t border-gold-line/30 pt-6 text-left text-sm">
        {order.items.map((item) => (
          <li key={`${item.productSlug}-${item.color}-${item.size}`} className="flex justify-between gap-4">
            <span>
              {item.productName} · {item.color} · {item.size}
            </span>
            <span>× {item.quantity}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}>Track this order</Link>
        </Button>
      </div>
    </div>
  );
}
