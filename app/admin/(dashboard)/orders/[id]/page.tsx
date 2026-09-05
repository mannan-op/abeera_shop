import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { getAccessToken } from "@/lib/admin/auth";
import { apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) notFound();

  let order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    items: {
      productName: string;
      color: string;
      size: string;
      quantity: number;
      price: number;
    }[];
    address: {
      name: string;
      line1: string;
      line2?: string | null;
      city: string;
      region: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    payment?: { method: string; status: string };
  };

  try {
    order = await apiClient.get(`/admin/orders/${id}`, { token, cache: "no-store" });
  } catch {
    notFound();
  }

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
        <h1 className="font-serif text-3xl">Order {order.orderNumber}</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">
          {order.status.toLowerCase()}
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
                  <p className="font-medium">{item.productName}</p>
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
                {order.address.city}, {order.address.region} {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              <p className="mt-2 text-muted-foreground">{order.address.phone}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-[#faf7f2] p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Payment
            </h2>
            <p className="mt-3 text-sm">
              {order.payment?.method ?? "—"} · {order.payment?.status ?? "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Placed{" "}
              {new Date(order.createdAt).toLocaleDateString("en-PK", {
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
