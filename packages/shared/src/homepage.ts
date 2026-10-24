import { z } from "zod";

/** Row id for the single storefront homepage document. */
export const HOMEPAGE_CONTENT_ID = "default";

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max);

function isSafeHttpOrPath(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const linkSchema = text(500).refine(isSafeHttpOrPath, {
  message: "Use a site path starting with / or an http(s) URL",
});

const imageUrlSchema = text(2000).refine(isSafeHttpOrPath, {
  message: "Use an image path starting with / or an http(s) URL",
});

export const homepageLinkSchema = z.object({
  label: text(80),
  href: linkSchema,
});

export const homepageHeroSchema = z.object({
  eyebrow: text(80),
  headlineLead: text(80),
  headlineEmphasis: optionalText(80),
  subline: text(120),
  body: text(400),
  imageUrl: imageUrlSchema,
  imageAlt: text(180),
  primaryCta: homepageLinkSchema,
  secondaryCta: homepageLinkSchema,
});

export const homepageTileSchema = z.object({
  title: text(80),
  label: text(80),
  imageUrl: imageUrlSchema,
  imageAlt: text(180),
  href: linkSchema,
});

export const homepageMomentSchema = z.object({
  title: text(80),
  copy: text(180),
  imageUrl: imageUrlSchema,
  imageAlt: text(180),
  href: linkSchema,
});

export const homepageMomentRailSchema = z.object({
  kicker: text(80),
  title: text(120),
  lede: text(280),
  viewAllLabel: text(40),
  viewAllHref: linkSchema,
  cardCtaLabel: text(40),
  moments: z.array(homepageMomentSchema).min(1).max(8),
});

export const homepageProductRailSchema = z.object({
  eyebrow: text(80),
  title: text(120),
  lede: text(280),
  href: linkSchema,
  viewAllLabel: text(40),
});

export const homepageBrandStorySchema = z.object({
  kicker: text(80),
  title: text(180),
  lede: text(280),
  body: text(800),
  ctaLabel: text(40),
  ctaHref: linkSchema,
  imageUrl: imageUrlSchema,
  imageAlt: text(180),
});

export const homepageTrustItemSchema = z.object({
  title: text(80),
  copy: text(180),
});

export const homepageNewsletterSchema = z.object({
  title: text(120),
  lede: text(280),
  emailLabel: text(40),
  placeholder: text(60),
  submitLabel: text(40),
  sendingLabel: text(40),
  successMessage: text(240),
});

export const homepageLookbookEditSchema = z.object({
  title: text(80),
  copy: text(240),
  imageUrl: imageUrlSchema,
  imageAlt: text(180),
  href: linkSchema,
});

export const homepageLookbookSchema = z.object({
  kicker: text(80),
  title: text(120),
  lede: text(320),
  cardCtaLabel: text(40),
  edits: z.array(homepageLookbookEditSchema).min(1).max(6),
});

export const homepageContentSchema = z.object({
  hero: homepageHeroSchema,
  collections: z.array(homepageTileSchema).min(1).max(6),
  moments: homepageMomentRailSchema,
  productRail: homepageProductRailSchema,
  brandStory: homepageBrandStorySchema,
  trust: z.array(homepageTrustItemSchema).min(1).max(8),
  newsletter: homepageNewsletterSchema,
  lookbook: homepageLookbookSchema,
});

export type HomepageContent = z.infer<typeof homepageContentSchema>;
export type HomepageHero = z.infer<typeof homepageHeroSchema>;
export type HomepageTile = z.infer<typeof homepageTileSchema>;
export type HomepageMoment = z.infer<typeof homepageMomentSchema>;
export type HomepageMomentRail = z.infer<typeof homepageMomentRailSchema>;
export type HomepageProductRail = z.infer<typeof homepageProductRailSchema>;
export type HomepageBrandStory = z.infer<typeof homepageBrandStorySchema>;
export type HomepageTrustItem = z.infer<typeof homepageTrustItemSchema>;
export type HomepageNewsletter = z.infer<typeof homepageNewsletterSchema>;
export type HomepageLookbook = z.infer<typeof homepageLookbookSchema>;
export type HomepageLookbookEdit = z.infer<typeof homepageLookbookEditSchema>;

export type HomepageDocumentResponse = {
  content: HomepageContent;
  updatedAt: string | null;
  source: "stored" | "default";
};

export function homepageIssueMessage(error: z.ZodError) {
  if (error.issues.length === 0) return "Invalid homepage content";
  return error.issues
    .slice(0, 4)
    .map((issue) => {
      const path = issue.path.map(String).join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(" ");
}

function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${width}`;
}

/**
 * Lahore House homepage copy and images. Used when the CMS row is missing
 * and when the storefront cannot reach the API.
 */
export const defaultHomepageContent: HomepageContent = homepageContentSchema.parse({
  hero: {
    eyebrow: "Eid · Lahore",
    headlineLead: "Woven with",
    headlineEmphasis: "tradition & grace",
    subline: "Lahore · Contemporary pret",
    body: "A Pakistani womenswear house for celebration and the everyday — lawn, chiffon, and stitched silhouettes with an international fashion-house calm.",
    imageUrl: unsplash("photo-1610030469983-98e550d6193c", 1800),
    imageAlt: "Woman in an embroidered cream festive ensemble, Abeera Eid Collection",
    primaryCta: { label: "Explore the Collection", href: "/shop" },
    secondaryCta: { label: "Shop unstitched", href: "/search?q=lawn" },
  },
  collections: [
    {
      href: "/search?q=festive",
      title: "Festive Edit",
      label: "Shop the line",
      imageUrl: unsplash("photo-1609607285694-e283bd2ea9a0", 1200),
      imageAlt: "Festive embroidered formal",
    },
    {
      href: "/search?q=lawn",
      title: "Everyday Pret",
      label: "Ready to wear",
      imageUrl: unsplash("photo-1496747611176-843222e1e57c", 1200),
      imageAlt: "Everyday pret silhouette",
    },
    {
      href: "/category/stitched-suits",
      title: "Formals",
      label: "Evening & occasion",
      imageUrl: unsplash("photo-1591604466107-ec97de577aff", 1200),
      imageAlt: "Formal occasion detail",
    },
  ],
  moments: {
    kicker: "Shop by moment",
    title: "Find your edit",
    lede: "Clear paths into the catalog — Sapphire-style rails, Abeera voice.",
    viewAllLabel: "View all pieces",
    viewAllHref: "/shop",
    cardCtaLabel: "Shop now",
    moments: [
      {
        href: "/category/new-arrivals",
        title: "New arrivals",
        copy: "Just landed for the season.",
        imageUrl: unsplash("photo-1483985988355-763728e1935b", 1200),
        imageAlt: "New arrivals",
      },
      {
        href: "/category/stitched-suits",
        title: "Stitched suits",
        copy: "Ready silhouettes, refined finish.",
        imageUrl: unsplash("photo-1469334031218-e382a71b716b", 2000),
        imageAlt: "Stitched suits",
      },
      {
        href: "/shop?sort=featured",
        title: "Bestsellers",
        copy: "Most-loved across the house.",
        imageUrl: unsplash("photo-1524504388940-b1c1722653e1", 900),
        imageAlt: "Bestsellers",
      },
      {
        href: "/category/accessories",
        title: "Accessories",
        copy: "Finishing pieces for the look.",
        imageUrl: unsplash("photo-1596815064285-45ed8a9c0463", 1000),
        imageAlt: "Accessories",
      },
    ],
  },
  productRail: {
    eyebrow: "Bestsellers",
    title: "Most loved",
    lede: "The pieces our customers love most.",
    href: "/shop?sort=featured",
    viewAllLabel: "View all",
  },
  brandStory: {
    kicker: "The House",
    title: "A Lahore house for lawn, chiffon, zardozi, and stitched pret",
    lede: "Made for Eid, weddings, and the days in between.",
    body: "Abeera began in Lahore. Lawn comes from Faisalabad, chiffon from mills we trust, and zardozi from artisans who have stitched for generations. The collection stays small on purpose.",
    ctaLabel: "About Abeera",
    ctaHref: "/about",
    imageUrl: unsplash("photo-1490481651871-ab68de25d43d", 1800),
    imageAlt: "Abeera festive campaign",
  },
  trust: [
    { title: "Free delivery", copy: "On orders over Rs. 5,000." },
    { title: "Easy exchange", copy: "Unworn pieces, tags on." },
    { title: "Cash on delivery", copy: "Pay when it arrives." },
    { title: "JazzCash · EasyPaisa", copy: "At checkout with COD." },
  ],
  newsletter: {
    title: "Letters from Lahore",
    lede: "Eid drops, lawn restocks, and pret worth writing home about. We keep the letters short.",
    emailLabel: "Email address",
    placeholder: "Email address",
    submitLabel: "Subscribe",
    sendingLabel: "Sending",
    successMessage: "Thank you. We write rarely, and only when there is something to say.",
  },
  lookbook: {
    kicker: "Collections",
    title: "The lookbook",
    lede: "The rails are being dressed for the season. Until new pieces land, wander the cloth we cut in Lahore.",
    cardCtaLabel: "Shop now",
    edits: [
      {
        href: "/search?q=lawn",
        title: "Lawn",
        copy: "Breathable prints from Faisalabad mills, stitched for warm days.",
        imageUrl: unsplash("photo-1622398925373-3f91b1e275f5", 1000),
        imageAlt: "Soft floral print",
      },
      {
        href: "/search?q=zardozi",
        title: "Chiffon & zardozi",
        copy: "Sheer layers and hand embroidery for weddings and Eid nights.",
        imageUrl: unsplash("photo-1596815064285-45ed8a9c0463", 1000),
        imageAlt: "Gold jewellery from the festive edit",
      },
      {
        href: "/shop",
        title: "The Eid drop",
        copy: "A celebration edit of stitched suits, cut in Lahore.",
        imageUrl: unsplash("photo-1609607285694-e283bd2ea9a0", 1200),
        imageAlt: "Embroidered festive formal",
      },
    ],
  },
});
