import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { demoOrders } from "@/lib/catalog/content";
import { formatPrice } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = demoOrders.find((o) => o.id === id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Orders
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="font-serif text-3xl">Order {order.number}</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">
          {order.status}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-[#faf7f2] p-6">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Items
          </h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.color} · {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-[#faf7f2] p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Shipping Address
            </h2>
            <div className="mt-3 text-sm leading-relaxed">
              <p className="font-medium">{order.address.name}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 ? <p>{order.address.line2}</p> : null}
              <p>
                {order.address.city}, {order.address.region}{" "}
                {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              <p className="mt-2 text-muted-foreground">{order.address.phone}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-[#faf7f2] p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Delivery
            </h2>
            <p className="mt-3 text-sm">{order.estimatedDelivery}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Placed{" "}
              {new Date(order.placedAt).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
