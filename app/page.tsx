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

export default function HomePage() {
  const bestsellers = getBestSellers(4);

  return (
    <>
      <EditorialHero />
      <CampaignThree />
      <TypeInterlude />
      <CampaignTwo />
      <ProductRail
        eyebrow="The atelier edit"
        title="Best sellers"
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
