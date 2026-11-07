import { z } from "zod";

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
const optionalUrl = (max: number) =>
  optionalText(max).refine((v) => v === "" || isSafeHttpOrPath(v), { message: "Use a path starting with / or an http(s) URL" });

export const shopPageSchema = z
  .object({
    heading: z.object({
      /** When off, the title is kept for screen readers only (the original design). */
      visible: z.boolean(),
      kicker: optionalText(60),
      title: text(80),
      intro: optionalText(320),
    }),
    showBreadcrumbs: z.boolean(),
    banner: z.object({
      enabled: z.boolean(),
      imageUrl: optionalUrl(2000),
      imageAlt: optionalText(180),
      kicker: optionalText(60),
      title: optionalText(80),
      buttonLabel: optionalText(40),
      href: optionalUrl(500),
    }),
    seo: z.object({
      title: text(70),
      description: text(200),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.banner.enabled && !value.banner.imageUrl) {
      ctx.addIssue({ code: "custom", path: ["banner", "imageUrl"], message: "Add a banner image or switch the banner off" });
    }
    if (value.banner.enabled && value.banner.buttonLabel && !value.banner.href) {
      ctx.addIssue({ code: "custom", path: ["banner", "href"], message: "Add where the button goes" });
    }
  });

export type ShopPageContent = z.infer<typeof shopPageSchema>;

/** Matches the /shop page before it was editable: no visible heading, breadcrumbs, no banner. */
export const defaultShopPageContent: ShopPageContent = shopPageSchema.parse({
  heading: { visible: false, kicker: "", title: "Shop the Abeera collection", intro: "" },
  showBreadcrumbs: true,
  banner: { enabled: false, imageUrl: "", imageAlt: "", kicker: "", title: "", buttonLabel: "", href: "/shop" },
  seo: {
    title: "Shop",
    description: "The full Abeera collection: unstitched lawn, pret, luxury formals, and accessories.",
  },
});
