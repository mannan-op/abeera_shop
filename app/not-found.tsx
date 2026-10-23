import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <p className="kicker">404</p>
      <h1 className="mt-4 font-serif text-4xl md:text-6xl">This page is not in the collection</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        It may have been a seasonal piece. The collection is still here.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Shop</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
