import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { demoOrders } from "@/lib/catalog/content";
import { formatPrice } from "@/lib/utils";

const statusColor: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
};

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {demoOrders.length} orders
      </p>

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
            {demoOrders.map((order) => (
              <tr key={order.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {order.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(order.placedAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs capitalize ${statusColor[order.status] ?? ""}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">{order.address.name}</td>
                <td className="px-4 py-3">{order.items.length}</td>
                <td className="px-4 py-3 text-right">{formatPrice(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
