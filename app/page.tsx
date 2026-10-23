import { EditorialHero } from "@/components/hero/editorial-hero";
import { BrandStory } from "@/components/sections/editorial-blocks";
import { FeaturedCollections } from "@/components/sections/featured-collections";
import { NewsletterSection } from "@/components/sections/gallery-newsletter";
import { Lookbook } from "@/components/sections/lookbook";
import { MomentRail } from "@/components/sections/moment-rail";
import { ProductRail } from "@/components/sections/product-rail";
import { TrustStrip } from "@/components/sections/trust-strip";
import { getBestSellers, getNewArrivals } from "@/lib/catalog";

export default async function HomePage() {
  const bestsellers = await getBestSellers(4);
  const featured = bestsellers.length > 0 ? bestsellers : await getNewArrivals(4);
  const loved = bestsellers.length > 0;

  return (
    <>
      <EditorialHero />
      <FeaturedCollections />
      <MomentRail />
      {featured.length > 0 ? (
        <ProductRail
          eyebrow={loved ? "Bestsellers" : "Just landed"}
          title={loved ? "Most loved" : "New arrivals"}
          lede={loved ? "The pieces our customers love most." : "Just landed for the season."}
          href={loved ? "/shop?sort=featured" : "/category/new-arrivals"}
          products={featured}
        />
      ) : (
        <Lookbook />
      )}
      <BrandStory />
      <TrustStrip />
      <NewsletterSection />
    </>
  );
}
