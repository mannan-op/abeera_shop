import Image from "next/image";
import Link from "next/link";

import { filtersFromSearch } from "@/components/products/catalog-view";
import { ShopProductCard } from "@/components/shop/shop-product-card";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { getCatalogFacets, getCategories, listProducts } from "@/lib/catalog";
import type { Category } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const STEP = 24;
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "One size"];

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function orderSizes(sizes: string[]) {
  const rank = (size: string) => {
    const index = SIZE_ORDER.indexOf(size);
    return index === -1 ? SIZE_ORDER.length + (Number.parseFloat(size) || 99) : index;
  };
  return [...sizes].sort((a, b) => rank(a) - rank(b));
}

function withParams(searchParams: SearchParams, mutate: (params: URLSearchParams) => void) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    (Array.isArray(value) ? value : [value]).forEach((entry) => {
      if (entry) params.append(key, entry);
    });
  });
  mutate(params);
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

async function circleImage(category: Category) {
  if (category.image) return category.image;
  const result = await listProducts({ category: category.slug, pageSize: 1 });
  return result.items[0]?.colors[0]?.images[0] ?? "";
}

export async function ShopCatalog({ searchParams }: { searchParams: SearchParams }) {
  const show = Math.min(10, Math.max(1, Number(first(searchParams.show) ?? 1) || 1));
  const filters = await filtersFromSearch(searchParams);
  const [result, facets, categories] = await Promise.all([
    listProducts({ ...filters, page: 1, pageSize: STEP * show }),
    getCatalogFacets(),
    getCategories(),
  ]);
  const circles = await Promise.all(
    categories.filter((category) => category.showInShop !== false).map(async (category) => ({
      name: category.name,
      href: `/category/${category.slug}`,
      image: await circleImage(category),
    })),
  );
  const allImage = result.items[0]?.colors[0]?.images[0] ?? circles[0]?.image ?? "";
  const shown = result.items.length;
  const filtered = ["size", "availability", "min", "max", "q"].some((key) => Boolean(first(searchParams[key])));

  return (
    <div>
      <nav aria-label="Shop by category" className="-mx-3.5 mt-6 overflow-x-auto [scrollbar-width:none] md:mx-0 md:mt-10">
        <ul className="flex w-max gap-1.5 px-3.5 pb-2 md:mx-auto md:gap-5 md:px-0">
          {[{ name: "All", href: "/shop", image: allImage, active: true }, ...circles.map((c) => ({ ...c, active: false }))].map(
            (circle) => (
              <li key={circle.href}>
                <Link href={circle.href} className="group flex w-[82px] flex-col items-center text-center md:w-[150px]">
                  <span
                    className={cn(
                      "relative block size-[70px] overflow-hidden rounded-full border-[3px] border-white bg-[#efe7db] shadow-[0_2px_12px_rgba(43,33,28,0.16)] transition duration-300 group-hover:shadow-[0_6px_20px_rgba(43,33,28,0.22)] md:size-[132px]",
                      circle.active && "ring-[1.5px] ring-foreground ring-offset-2 ring-offset-background",
                    )}
                  >
                    {circle.image ? (
                      <Image
                        src={circle.image}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 132px, 70px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </span>
                  <span className="mt-2.5 text-[10px] leading-tight tracking-[0.06em] uppercase md:mt-3 md:text-[11px]">
                    {circle.name}
                  </span>
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      <ShopToolbar
        total={result.total}
        sizes={orderSizes(facets.sizes)}
        min={facets.min}
        max={facets.max}
        categories={categories.map(({ name, slug }) => ({ name, href: `/category/${slug}` }))}
      />

      {shown === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl">Nothing matches this edit</p>
          <p className="mt-3 text-sm text-muted-foreground">Try removing a filter, or start again from the full collection.</p>
          <Link href="/shop" className="mt-6 inline-block border border-foreground px-10 py-3 text-[11px] tracking-[0.14em] uppercase">
            {filtered ? "Clear filters" : "Shop all"}
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-x-3.5 gap-y-8 lg:grid-cols-4 lg:gap-x-[30px] lg:gap-y-12">
            {result.items.map((product, index) => (
              <li key={product.id}>
                <ShopProductCard product={product} priority={index < 4} />
              </li>
            ))}
          </ul>
          <div className="mt-14 text-center">
            <p className="text-[12px] text-muted-foreground">
              Showing {shown} of {result.total}
            </p>
            <div className="mx-auto mt-3 h-px w-40 bg-border">
              <div className="h-px bg-foreground" style={{ width: `${Math.min(100, (shown / Math.max(1, result.total)) * 100)}%` }} />
            </div>
            {shown < result.total ? (
              <Link
                href={withParams(searchParams, (params) => params.set("show", String(show + 1)))}
                scroll={false}
                className="mt-6 inline-block border border-foreground px-12 py-3.5 text-[11px] tracking-[0.14em] uppercase transition-colors hover:bg-foreground hover:text-background"
              >
                Load more
              </Link>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
