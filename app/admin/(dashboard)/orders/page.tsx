import Link from "next/link";

import { getAccessToken } from "@/lib/admin/auth";
import { apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

type OrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  address?: { name: string };
  items: unknown[];
  total: number;
};

export default async function AdminOrdersPage() {
  const token = await getAccessToken();
  let orders: OrderRow[] = [];
  if (token) {
    try {
      const result = await apiClient.get<{ items: OrderRow[] }>("/admin/orders", {
        token,
        cache: "no-store",
      });
      orders = result.items;
    } catch {
      orders = [];
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-[#faf7f2]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs capitalize ${statusColor[order.status] ?? "bg-muted"}`}
                  >
                    {order.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3">{order.address?.name ?? "—"}</td>
                <td className="px-4 py-3">{order.items.length}</td>
                <td className="px-4 py-3 text-right">{formatPrice(order.total)}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No orders yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
