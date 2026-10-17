import { notFound } from "next/navigation";

import { ProductPurchase } from "@/components/product/product-purchase";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ProductRail } from "@/components/sections/product-rail";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCategory, getProduct, getRelated, reviews } from "@/lib/catalog";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.tagline,
    openGraph: {
      images: [product.colors[0].images[0]],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelated(product);
  const category = await getCategory(product.category);
  const productReviews = reviews.filter((review) => review.productId === product.id);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
          { href: `/category/${product.category}`, label: category?.name ?? product.category },
          { label: product.name },
        ]}
      />
      <div className="mt-8">
        <ProductPurchase product={product} />
      </div>
      {productReviews.length > 0 ? (
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="font-serif text-4xl">Reviews</h2>
          <ul className="mt-8 space-y-8">
            {productReviews.map((review) => (
              <li key={review.id}>
                <p className="text-sm font-medium">{review.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {review.author} · {review.location} · {review.rating}/5
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {review.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ProductRail
        eyebrow="You may also like"
        title="Related pieces"
        href={`/category/${product.category}`}
        products={related}
      />
      <RecentlyViewed currentId={product.id} />
    </div>
  );
}
