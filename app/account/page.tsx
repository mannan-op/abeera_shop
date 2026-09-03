import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { demoAddress, demoOrders } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export default function AccountPage() {
  const latest = demoOrders[0];
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-5xl">Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A preview of the client account. Authentication is not connected.
      </p>
      <div className="mt-8">
        <AccountNav />
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="kicker">Profile</h2>
          <p className="mt-4">{demoAddress.name}</p>
          <p className="text-sm text-muted-foreground">amira@abeera.example</p>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="kicker">Latest order</h2>
          <p className="mt-4">{latest.number}</p>
          <p className="text-sm text-muted-foreground">{formatPrice(latest.total)}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href={`/account/orders/${latest.id}`}>View</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
