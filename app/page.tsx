import { EditorialHero } from "@/components/hero/editorial-hero";
import { CategoryChips } from "@/components/sections/category-chips";
import { Lookbook } from "@/components/sections/lookbook";
import { NewsletterSection } from "@/components/sections/gallery-newsletter";
import { ProductRail } from "@/components/sections/product-rail";
import { TrustStrip } from "@/components/sections/trust-strip";
import { getBestSellers, getNewArrivals } from "@/lib/catalog";

export default async function HomePage() {
  const bestsellers = await getBestSellers(4);
  const featured = bestsellers.length > 0 ? bestsellers : await getNewArrivals(4);

  return (
    <>
      <EditorialHero />
      <CategoryChips />
      {featured.length > 0 ? (
        <ProductRail
          eyebrow={bestsellers.length > 0 ? "Most loved" : "Just landed"}
          title={bestsellers.length > 0 ? "Best Sellers" : "New Arrivals"}
          href={bestsellers.length > 0 ? "/shop?sort=featured" : "/category/new-arrivals"}
          products={featured}
        />
      ) : (
        <Lookbook />
      )}
      <TrustStrip />
      <NewsletterSection />
    </>
  );
}
