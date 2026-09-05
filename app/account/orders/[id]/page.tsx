import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { getCustomerAccessToken } from "@/lib/auth/customer-actions";
import { formatPrice } from "@/lib/utils";

type ApiOrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  shipping: number;
  address: { line1: string; city: string; region: string };
  items: {
    productName: string;
    productSlug: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
  }[];
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getCustomerAccessToken();
  if (!token) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-sm text-muted-foreground">
          <Link href={`/login?next=/account/orders/${id}`} className="underline">
            Sign in
          </Link>{" "}
          to view this order.
        </p>
      </div>
    );
  }

  let order: ApiOrderDetail;
  try {
    order = await apiClient.get<ApiOrderDetail>(`/orders/${id}`, {
      token,
      cache: "no-store",
    });
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-4xl">Order {order.orderNumber}</h1>
      <div className="mt-8">
        <AccountNav />
      </div>
      <p className="mt-8 text-sm capitalize text-muted-foreground">
        {order.status.toLowerCase()}
      </p>
      <ul className="mt-8 space-y-3 text-sm">
        {order.items.map((item) => (
          <li key={`${item.productSlug}-${item.color}-${item.size}`} className="flex justify-between">
            <Link href={`/product/${item.productSlug}`}>
              {item.productName} · {item.color} · {item.size} × {item.quantity}
            </Link>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm">
        Ship to {order.address.line1}, {order.address.city}, {order.address.region}
      </p>
      <p className="mt-2 text-sm font-medium">Total {formatPrice(order.total)}</p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/account/orders">All orders</Link>
      </Button>
    </div>
  );
}
