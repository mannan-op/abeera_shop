import { CatalogToolbar } from "@/components/products/catalog-controls";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { getCatalogFacets, listProducts } from "@/lib/catalog";
import type { CategorySlug, ProductFilters, SortKey } from "@/lib/catalog/types";
import Link from "next/link";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function all(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function filtersFromSearch(
  searchParams: Record<string, string | string[] | undefined>,
  category?: CategorySlug,
): Promise<ProductFilters> {
  const bounds = await getCatalogFacets(category);
  return {
    category,
    query: first(searchParams.q),
    colors: all(searchParams.color),
    sizes: all(searchParams.size),
    availability:
      first(searchParams.availability) === "in-stock" ||
      first(searchParams.availability) === "sale"
        ? (first(searchParams.availability) as "in-stock" | "sale")
        : "all",
    minPrice: first(searchParams.min) ? Number(first(searchParams.min)) : bounds.min,
    maxPrice: first(searchParams.max) ? Number(first(searchParams.max)) : bounds.max,
    sort: (first(searchParams.sort) as SortKey | undefined) ?? "featured",
    page: Number(first(searchParams.page) ?? 1),
  };
}

export async function CatalogView({
  searchParams,
  category,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  category?: CategorySlug;
}) {
  const filters = await filtersFromSearch(searchParams, category);
  const result = await listProducts(filters);
  const options = await getCatalogFacets(category);

  return (
    <div>
      <CatalogToolbar total={result.total} options={options} />
      <ProductGrid products={result.items} />
      {result.pageCount > 1 ? (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: result.pageCount }, (_, index) => {
            const page = index + 1;
            const params = new URLSearchParams();
            Object.entries(searchParams).forEach(([key, value]) => {
              if (key === "page") return;
              (Array.isArray(value) ? value : [value]).forEach((entry) => {
                if (entry) params.append(key, entry);
              });
            });
            params.set("page", String(page));
            return (
              <Button key={page} asChild variant={page === result.page ? "primary" : "outline"} size="icon">
                <Link href={`?${params.toString()}`}>{page}</Link>
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
