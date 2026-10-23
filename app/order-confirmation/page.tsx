import Link from "next/link";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { getCustomerAccessToken } from "@/lib/auth/customer-actions";
import { formatPrice } from "@/lib/utils";

type ConfirmedOrder = {
  id: string;
  orderNumber: string;
  total: number;
  shipping: number;
  shippingMethod: string;
  discount: number;
  address: { line1: string; city: string };
  items: { productName: string; color: string; size: string; quantity: number }[];
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-serif text-4xl">No order to show</h1>
        <Button asChild className="mt-8">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  const token = await getCustomerAccessToken();
  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-serif text-4xl">Sign in to see this order</h1>
        <Button asChild className="mt-8">
          <Link href={`/login?next=${encodeURIComponent(`/order-confirmation?id=${id}`)}`}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  let order: ConfirmedOrder;
  try {
    order = await apiClient.get<ConfirmedOrder>(`/orders/${id}`, { token, cache: "no-store" });
  } catch {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-serif text-4xl">No order to show</h1>
        <Button asChild className="mt-8">
          <Link href="/account/orders">View orders</Link>
        </Button>
      </div>
    );
  }

  const delivery = order.shippingMethod === "express" ? "1–2 business days" : "3–5 business days";

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center md:py-28">
      <p className="kicker">Thank you</p>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">Your order is confirmed in Lahore</h1>
      <p className="mt-4 text-sm text-muted-foreground">Order {order.orderNumber}.</p>
      <dl className="mt-10 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Ship to</dt>
          <dd>
            {order.address.line1}, {order.address.city}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd>{delivery}</dd>
        </div>
        {order.discount > 0 ? (
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>−{formatPrice(order.discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{order.shipping === 0 ? "Complimentary" : formatPrice(order.shipping)}</dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>
      <ul className="mt-8 space-y-2 text-left text-sm">
        {order.items.map((item) => (
          <li key={`${item.productName}-${item.color}-${item.size}`} className="flex justify-between">
            <span>
              {item.productName} · {item.color}
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
          <Link href={`/account/orders/${order.id}`}>View order</Link>
        </Button>
      </div>
    </div>
  );
}
