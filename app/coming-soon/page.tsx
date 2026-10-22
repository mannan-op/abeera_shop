import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isComingSoon } from "@/lib/coming-soon";

export const metadata: Metadata = {
  title: "Coming soon",
  description: "Abeera Collection is opening soon.",
};

export default function ComingSoonPage() {
  if (!isComingSoon()) redirect("/");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 py-24 text-center text-ivory">
      <p className="kicker text-gold">Lahore</p>
      <h1 className="mt-5 font-serif text-5xl leading-none tracking-tight md:text-7xl">
        Abeera Collection
      </h1>
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/80">The shop is opening soon.</p>
    </main>
  );
}
