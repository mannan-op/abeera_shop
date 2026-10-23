import {
  defaultHomepageContent,
  homepageContentSchema,
  type HomepageDocumentResponse,
} from "@abeera/shared";

import { EditorialHero } from "@/components/hero/editorial-hero";
import { BrandStory } from "@/components/sections/editorial-blocks";
import { FeaturedCollections } from "@/components/sections/featured-collections";
import { NewsletterSection } from "@/components/sections/gallery-newsletter";
import { Lookbook } from "@/components/sections/lookbook";
import { MomentRail } from "@/components/sections/moment-rail";
import { ProductRail } from "@/components/sections/product-rail";
import { TrustStrip } from "@/components/sections/trust-strip";
import { apiClient } from "@/lib/api/client";
import { getBestSellers, getNewArrivals } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function isFrameworkBailout(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && error.code === "NEXT_STATIC_GEN_BAILOUT") return true;
  if ("digest" in error && typeof error.digest === "string") {
    return (
      error.digest.startsWith("NEXT_REDIRECT") ||
      error.digest.startsWith("NEXT_HTTP_ERROR_FALLBACK") ||
      error.digest.startsWith("NEXT_NOT_FOUND")
    );
  }
  return false;
}

async function getHomepageContent() {
  try {
    const response = await apiClient.get<HomepageDocumentResponse>("/homepage", { cache: "no-store" });
    const parsed = homepageContentSchema.safeParse(response.content);
    if (!parsed.success) return defaultHomepageContent;
    return parsed.data;
  } catch (error) {
    if (isFrameworkBailout(error)) throw error;
    return defaultHomepageContent;
  }
}

export default async function HomePage() {
  const content = await getHomepageContent();
  const bestsellers = await getBestSellers(4);
  const featured = bestsellers.length > 0 ? bestsellers : await getNewArrivals(4);

  return (
    <>
      <EditorialHero hero={content.hero} />
      <FeaturedCollections tiles={content.collections} />
      <MomentRail section={content.moments} />
      {featured.length > 0 ? (
        <ProductRail
          eyebrow={content.productRail.eyebrow}
          title={content.productRail.title}
          lede={content.productRail.lede}
          href={content.productRail.href}
          viewAllLabel={content.productRail.viewAllLabel}
          products={featured}
        />
      ) : (
        <Lookbook content={content.lookbook} />
      )}
      <BrandStory story={content.brandStory} />
      <TrustStrip items={content.trust} />
      <NewsletterSection newsletter={content.newsletter} />
    </>
  );
}
