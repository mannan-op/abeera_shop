import { Suspense } from "react";

import { CatalogView } from "@/components/products/catalog-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Shop",
  description: "The full Abeera collection — unstitched, prêt, luxury formals, and accessories.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
      <p className="kicker">Lahore</p>
      <h1 className="mt-4 font-serif text-5xl md:text-6xl">Shop</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        From everyday lawn to festive formals — crafted for the modern Pakistani woman.
      </p>
      <div className="mt-10">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <CatalogView searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
