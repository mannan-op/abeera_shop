import type { Metadata } from "next";

import { TrackOrderForm } from "@/components/checkout/track-order-form";

export const metadata: Metadata = { title: "Track your order", description: "Check the status of your Abeera order with your order number and email." };

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <p className="kicker">Orders</p>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">Track your order</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Enter the order number from your confirmation email and the email address you used at checkout.
      </p>
      <TrackOrderForm initialOrder={order ?? ""} />
    </div>
  );
}
