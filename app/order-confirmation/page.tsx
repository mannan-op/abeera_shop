"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/catalog/types";

type LastOrder = {
  number: string;
  email: string;
  items: CartItem[];
  total: number;
  shipping: string;
  address: string;
  estimatedDelivery: string;
};

export default function OrderConfirmationPage() {
  const [order, setOrder] = React.useState<LastOrder | null>(null);

  React.useEffect(() => {
    const raw = window.sessionStorage.getItem("abeera:last-order");
    if (raw) setOrder(JSON.parse(raw) as LastOrder);
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-serif text-4xl">No order to show</h1>
        <Button asChild className="mt-8">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center md:py-28">
      <p className="kicker">Thank you</p>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">Your order is with the atelier</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        A confirmation is on its way to {order.email}. Order {order.number}.
      </p>
      <dl className="mt-10 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Ship to</dt>
          <dd>{order.address}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd>{order.estimatedDelivery}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Total</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>
      <ul className="mt-8 space-y-2 text-left text-sm">
        {order.items.map((item) => (
          <li key={`${item.productId}-${item.size}`} className="flex justify-between">
            <span>
              {item.name} · {item.color}
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
          <Link href="/account/orders">View orders</Link>
        </Button>
      </div>
    </div>
  );
}
