"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupOrder, type TrackedOrder } from "@/lib/checkout/actions";
import { cn, formatPrice } from "@/lib/utils";

const STEPS = [
  { key: "PENDING", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "On its way" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function TrackOrderForm({ initialOrder }: { initialOrder: string }) {
  const [number, setNumber] = useState(initialOrder);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!number.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter your order number and a valid email.");
      return;
    }
    start(async () => {
      const res = await lookupOrder(number.trim(), email.trim());
      if (res.ok) setOrder(res.order);
      else {
        setOrder(null);
        setError(res.error);
      }
    });
  }

  const stepIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-4 border-y border-gold-line/30 py-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="order-number">Order number</Label>
          <Input id="order-number" className="mt-2" placeholder="AB-…" value={number} onChange={(e) => setNumber(e.target.value)} autoComplete="off" />
        </div>
        <div>
          <Label htmlFor="order-email">Email</Label>
          <Input id="order-email" type="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Track order"}
        </Button>
      </form>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {order ? (
        <section aria-live="polite" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-2xl">Order {order.orderNumber}</h2>
            <p className="text-xs text-muted-foreground">Placed {dateFmt.format(new Date(order.createdAt))}</p>
          </div>

          {order.status === "CANCELLED" ? (
            <p className="mt-4 rounded-lg border border-destructive/40 px-4 py-3 text-sm">This order was cancelled. If you have questions, contact us.</p>
          ) : (
            <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Order progress">
              {STEPS.map((s, i) => (
                <li key={s.key} className="text-center" aria-current={i === stepIndex ? "step" : undefined}>
                  <div className={cn("h-1 rounded-full", i <= stepIndex ? "bg-espresso" : "bg-gold-line/30")} />
                  <p className={cn("mt-2 text-[0.7rem] tracking-[0.08em] uppercase", i <= stepIndex ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
                </li>
              ))}
            </ol>
          )}

          <ul className="mt-8 divide-y divide-gold-line/20 border-y border-gold-line/30">
            {order.items.map((item) => (
              <li key={`${item.productSlug}-${item.color}-${item.size}`} className="flex items-center gap-4 py-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-muted">
                  {item.productImage ? <Image src={item.productImage} alt="" fill sizes="64px" className="object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <Link href={`/product/${item.productSlug}`} className="font-serif text-lg hover:underline">
                    {item.productName}
                  </Link>
                  <p className="text-muted-foreground">
                    {item.color} · Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd>−{formatPrice(order.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <dt>Payment</dt>
              <dd>{order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod}</dd>
            </div>
          </dl>
          <p className="mt-8 text-xs text-muted-foreground">
            Delivering to {order.city} in {order.shippingMethod === "express" ? "1–2" : "4–5"} working days. Need to exchange something? See our{" "}
            <Link href="/refund-policy" className="underline underline-offset-4">
              exchange policy
            </Link>
            .
          </p>
        </section>
      ) : null}
    </>
  );
}
