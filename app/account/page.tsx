import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { getCustomerAccessToken } from "@/lib/auth/customer-actions";
import { destroySession } from "@/lib/admin/auth";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Account" };

type Profile = { name: string; email: string };
type ApiOrder = { id: string; orderNumber: string; total: number };

export default async function AccountPage() {
  const token = await getCustomerAccessToken();
  let profile: Profile | null = null;
  let latest: ApiOrder | null = null;

  if (token) {
    try {
      profile = await apiClient.get<Profile>("/users/me", { token, cache: "no-store" });
      const orders = await apiClient.get<{ items: ApiOrder[] }>("/orders", {
        token,
        cache: "no-store",
      });
      latest = orders.items[0] ?? null;
    } catch {
      profile = null;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-16">
      <h1 className="font-serif text-5xl">Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {profile ? `Signed in as ${profile.email}` : "Sign in to manage orders and addresses."}
      </p>
      <div className="mt-8">
        <AccountNav />
      </div>
      {!token || !profile ? (
        <div className="mt-10">
          <Button asChild>
            <Link href="/login?next=/account">Sign in</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="kicker">Profile</h2>
            <p className="mt-4">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <form
              className="mt-6"
              action={async () => {
                "use server";
                await destroySession();
              }}
            >
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="kicker">Latest order</h2>
            {latest ? (
              <>
                <p className="mt-4">{latest.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(latest.total)}</p>
                <Button asChild variant="outline" className="mt-6">
                  <Link href={`/account/orders/${latest.id}`}>View</Link>
                </Button>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
