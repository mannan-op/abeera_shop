import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogView } from "@/components/products/catalog-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCategorySlugs, getCategory } from "@/lib/catalog";
import type { CategorySlug } from "@/lib/catalog/types";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const category = getCategory(slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
          { label: category.name },
        ]}
      />
      <p className="kicker mt-8">
        {category.editorial}
      </p>
      <h1 className="mt-4 font-serif text-5xl md:text-6xl">{category.name}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {category.description}
      </p>
      <div className="mt-10">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <CatalogView searchParams={query} category={category.slug as CategorySlug} />
        </Suspense>
      </div>
    </div>
  );
}
