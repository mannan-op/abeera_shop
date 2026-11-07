import { z } from "zod";

import { EXPRESS_SHIPPING, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "./constants";

/** Row ids in the `site_documents` table. */
export const SITE_SETTINGS_ID = "site-settings";
export const SHOP_PAGE_ID = "shop-page";

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

const linkSchema = text(500).refine(isSafeHttpOrPath, { message: "Use a site path starting with / or an http(s) URL" });
const optionalLinkSchema = optionalText(500).refine((v) => v === "" || isSafeHttpOrPath(v), {
  message: "Use a site path starting with / or an http(s) URL",
});
const optionalImageSchema = optionalText(2000).refine((v) => v === "" || isSafeHttpOrPath(v), {
  message: "Use an image path starting with / or an http(s) URL",
});
/** Whole paisa, at most Rs 1,000,000. */
const paisa = z.number().int().min(0).max(100_000_000);

export const menuLinkSchema = z.object({
  label: text(40),
  href: linkSchema,
  visible: z.boolean().default(true),
});

export const navigationSchema = z.object({
  /** Small line under the logo in the menu drawer. */
  tagline: optionalText(40),
  /** Large links at the top of the menu. */
  primary: z.array(menuLinkSchema).max(12),
  /** Insert every shop category after the large links. */
  showCategories: z.boolean(),
  /** Small links under the large ones. */
  secondary: z.array(menuLinkSchema).max(12),
});

export const announcementSchema = z.object({
  enabled: z.boolean(),
  messages: z
    .array(z.object({ text: text(80), href: optionalLinkSchema }))
    .min(1)
    .max(8),
});

export const footerSchema = z.object({
  blurb: optionalText(400),
  columns: z
    .array(z.object({ title: text(30), links: z.array(z.object({ label: text(40), href: linkSchema })).max(10) }))
    .max(4),
  copyrightName: text(60),
  location: optionalText(80),
});

export const storeInfoSchema = z.object({
  standardShipping: paisa,
  expressShipping: paisa,
  /** Orders at or above this subtotal get free standard delivery. 0 turns it off. */
  freeShippingThreshold: paisa,
  contactEmail: optionalText(120).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "Enter a valid email" }),
  contactPhone: optionalText(30),
  /** Where "New order" emails go. */
  orderNotificationEmail: optionalText(160)
    .default("")
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "Enter a valid email" }),
  /** Shop or office address customers can write to. Shown on the contact and policy pages. */
  address: optionalText(200).default(""),
  /** Digits with country code, e.g. 923001234567. Empty uses NEXT_PUBLIC_WHATSAPP_NUMBER. */
  whatsappNumber: optionalText(20).refine((v) => v === "" || /^\+?[0-9 ]{8,20}$/.test(v), { message: "Use digits with the country code, e.g. 923001234567" }),
  payments: z.object({
    cod: z.boolean(),
    /** Card payments need a gateway; none is connected, so checkout never shows card yet. */
    card: z.boolean(),
  }),
});

export const seoSchema = z.object({
  defaultTitle: text(70),
  titleTemplate: text(70).refine((v) => v.includes("%s"), { message: "Must include %s where the page name goes" }),
  description: text(200),
  shareDescription: text(200),
  shareImage: optionalImageSchema,
});

export const siteSettingsSchema = z.object({
  navigation: navigationSchema,
  announcement: announcementSchema,
  footer: footerSchema,
  store: storeInfoSchema,
  seo: seoSchema,
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type MenuLink = z.infer<typeof menuLinkSchema>;

export type SiteDocumentResponse<T> = {
  content: T;
  updatedAt: string | null;
  source: "stored" | "default";
};

/** Defaults equal the storefront's previously hard-coded content. */
export const defaultSiteSettings: SiteSettings = siteSettingsSchema.parse({
  navigation: {
    tagline: "Lahore",
    primary: [{ label: "Shop", href: "/shop", visible: true }],
    showCategories: true,
    secondary: [
      { label: "About", href: "/about", visible: true },
      { label: "Contact", href: "/contact", visible: true },
      { label: "Track order", href: "/track-order", visible: true },
      { label: "Wishlist", href: "/wishlist", visible: true },
    ],
  },
  announcement: {
    enabled: true,
    messages: [
      { text: "Free delivery over Rs. 5,000", href: "" },
      { text: "Cash on delivery available", href: "" },
      { text: "Eid collection now live", href: "/shop" },
      { text: "WhatsApp help on product pages", href: "/contact" },
    ],
  },
  footer: {
    blurb:
      "A Lahore house for lawn, chiffon, zardozi, and stitched pret — made for Eid, weddings, and the days in between.",
    columns: [
      {
        title: "Shop",
        links: [
          { href: "/category/new-arrivals", label: "New arrivals" },
          { href: "/category/stitched-suits", label: "Stitched suits" },
          { href: "/shop?sort=featured", label: "Bestsellers" },
          { href: "/category/sale", label: "Sale" },
        ],
      },
      {
        title: "Help",
        links: [
          { href: "/contact", label: "Contact" },
          { href: "/shipping", label: "Shipping" },
          { href: "/refund-policy", label: "Exchanges" },
          { href: "/faq", label: "FAQ" },
        ],
      },
      {
        title: "House",
        links: [
          { href: "/about", label: "About" },
          { href: "/privacy-policy", label: "Privacy policy" },
          { href: "/terms-and-conditions", label: "Terms & conditions" },
          { href: "/refund-policy", label: "Exchange & refund policy" },
          { href: "/ownership", label: "Ownership" },
        ],
      },
    ],
    copyrightName: "Abeera",
    location: "Lahore, Pakistan",
  },
  store: {
    standardShipping: STANDARD_SHIPPING,
    expressShipping: EXPRESS_SHIPPING,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    contactEmail: "collection.abeeras.new@gmail.com",
    contactPhone: "03224658722",
    orderNotificationEmail: "collection.abeeras.new@gmail.com",
    address: "Shop # B7, Jinnah Foundation Market, Model Town Link Road, Lahore, Pakistan",
    whatsappNumber: "923224658722",
    payments: { cod: true, card: false },
  },
  seo: {
    defaultTitle: "Abeera — Pakistani Women's Clothing",
    titleTemplate: "%s — Abeera",
    description:
      "Abeera is a Lahore house for Pakistani women's clothing — lawn, chiffon, zardozi, stitched suits, and festive pret.",
    shareDescription: "Lawn, chiffon, zardozi, and stitched pret from Lahore.",
    shareImage: "",
  },
});

/** No card gateway is integrated yet, so card can never be offered. */
export const CARD_GATEWAY_CONNECTED = false;

/** Payment methods checkout may offer under these settings. */
export function enabledPaymentMethods(settings: SiteSettings): ("COD" | "CARD")[] {
  const methods: ("COD" | "CARD")[] = [];
  if (settings.store.payments.cod) methods.push("COD");
  if (settings.store.payments.card && CARD_GATEWAY_CONNECTED) methods.push("CARD");
  return methods;
}

/** Shipping rates for quoteTotals from the store settings. */
export function shippingRates(settings: SiteSettings) {
  return {
    standard: settings.store.standardShipping,
    express: settings.store.expressShipping,
    freeThreshold: settings.store.freeShippingThreshold,
  };
}

export function siteIssueMessage(error: z.ZodError) {
  if (error.issues.length === 0) return "Invalid content";
  return error.issues
    .slice(0, 4)
    .map((issue) => {
      const path = issue.path.map(String).join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(" ");
}
