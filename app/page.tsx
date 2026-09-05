import { EditorialHero } from "@/components/hero/editorial-hero";
import {
  BrandStrip,
  CampaignFour,
  CampaignThree,
  CampaignTwo,
  TypeInterlude,
} from "@/components/sections/campaigns";
import { SocialGallery, NewsletterSection } from "@/components/sections/gallery-newsletter";
import { ProductRail } from "@/components/sections/product-rail";
import { Testimonials } from "@/components/sections/testimonials";
import { getBestSellers } from "@/lib/catalog";

export default async function HomePage() {
  const bestsellers = await getBestSellers(4);

  return (
    <>
      <EditorialHero />
      <CampaignThree />
      <TypeInterlude />
      <CampaignTwo />
      <ProductRail
        eyebrow="Most loved"
        title="Best Sellers"
        href="/shop?sort=featured"
        products={bestsellers}
      />
      <CampaignFour />
      <BrandStrip />
      <Testimonials />
      <SocialGallery />
      <NewsletterSection />
    </>
  );
}
