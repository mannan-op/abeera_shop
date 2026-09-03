import { Suspense } from "react";

import { CatalogView } from "@/components/products/catalog-view";
import { popularSearches } from "@/lib/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBox } from "@/components/search/search-box";
import Link from "next/link";

export const metadata = {
  title: "Search",
  description: "Search the Abeera atelier.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
      <p className="kicker">Search</p>
      <h1 className="mt-4 font-serif text-5xl">
        {query ? `Results for “${query}”` : "Search the atelier"}
      </h1>
      <div className="mt-8 max-w-xl">
        <SearchBox defaultValue={query} />
      </div>
      {!query ? (
        <div className="mt-10">
          <p className="kicker">Popular</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <CatalogView searchParams={params} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
