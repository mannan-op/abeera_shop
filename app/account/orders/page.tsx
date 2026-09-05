import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { getCustomerAccessToken } from "@/lib/auth/customer-actions";
import { apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders" };

type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
};

export default async function OrdersPage() {
  const token = await getCustomerAccessToken();
  let orders: ApiOrder[] = [];

  if (token) {
    try {
      const result = await apiClient.get<{ items: ApiOrder[] }>("/orders", {
        token,
        cache: "no-store",
      });
      orders = result.items;
    } catch {
      orders = [];
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-4xl">Orders</h1>
      <div className="mt-8">
        <AccountNav />
      </div>
      {!token ? (
        <p className="mt-8 text-sm text-muted-foreground">
          <Link href="/login?next=/account/orders" className="underline">
            Sign in
          </Link>{" "}
          to view your orders.
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between py-5">
              <div>
                <Link href={`/account/orders/${order.id}`} className="font-medium">
                  {order.orderNumber}
                </Link>
                <p className="text-sm capitalize text-muted-foreground">
                  {order.status.toLowerCase()}
                </p>
              </div>
              <span>{formatPrice(order.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
