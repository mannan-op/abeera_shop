import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { demoOrders } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = demoOrders.find((entry) => entry.id === id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-4xl">Order {order.number}</h1>
      <div className="mt-8">
        <AccountNav />
      </div>
      <p className="mt-8 text-sm capitalize text-muted-foreground">{order.status}</p>
      <p className="mt-1 text-sm">{order.estimatedDelivery}</p>
      <ul className="mt-8 space-y-3 text-sm">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between">
            <Link href={`/product/${item.slug}`}>{item.name}</Link>
            <span>{formatPrice(item.price)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm">Ship to {order.address.line1}, {order.address.city}</p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/account/orders">All orders</Link>
      </Button>
    </div>
  );
}
