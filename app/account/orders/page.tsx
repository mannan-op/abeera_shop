import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { demoOrders } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-4xl">Orders</h1>
      <div className="mt-8">
        <AccountNav />
      </div>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {demoOrders.map((order) => (
          <li key={order.id} className="flex items-center justify-between py-5">
            <div>
              <Link href={`/account/orders/${order.id}`} className="font-medium">
                {order.number}
              </Link>
              <p className="text-sm capitalize text-muted-foreground">{order.status}</p>
            </div>
            <span>{formatPrice(order.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
