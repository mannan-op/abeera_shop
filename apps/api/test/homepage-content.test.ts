import assert from "node:assert/strict";

import {
  defaultHomepageContent,
  homepageContentSchema,
  homepageIssueMessage,
} from "@abeera/shared";

const parsed = homepageContentSchema.parse(defaultHomepageContent);
assert.equal(parsed.hero.headlineLead, "Woven with");
assert.equal(parsed.hero.headlineEmphasis, "tradition & grace");
assert.equal(parsed.hero.eyebrow, "Eid · Lahore");
assert.equal(parsed.collections.length, 3);
assert.equal(parsed.collections[0]?.title, "Festive Edit");
assert.equal(parsed.moments.moments.length, 4);
assert.equal(parsed.moments.viewAllLabel, "View all pieces");
assert.equal(parsed.productRail.title, "Most loved");
assert.equal(parsed.brandStory.ctaLabel, "About Abeera");
assert.equal(parsed.trust.length, 4);
assert.equal(parsed.trust[0]?.title, "Free delivery");
assert.equal(parsed.newsletter.title, "Letters from Lahore");
assert.equal(parsed.newsletter.submitLabel, "Subscribe");
assert.equal(parsed.lookbook.edits.length, 3);
assert.match(parsed.hero.imageUrl, /^https:\/\/images\.unsplash\.com\/photo-1610030469983-98e550d6193c\?/);

const trimmed = homepageContentSchema.parse({
  ...defaultHomepageContent,
  hero: { ...defaultHomepageContent.hero, eyebrow: "  Eid · Lahore  " },
  extra: true,
});
assert.equal(trimmed.hero.eyebrow, "Eid · Lahore");
assert.equal("extra" in trimmed, false);

const noEmphasis = homepageContentSchema.parse({
  ...defaultHomepageContent,
  hero: { ...defaultHomepageContent.hero, headlineEmphasis: "   " },
});
assert.equal(noEmphasis.hero.headlineEmphasis, "");

function reject(patch: unknown, label: string) {
  const result = homepageContentSchema.safeParse(patch);
  assert.equal(result.success, false, label);
  if (!result.success) assert.ok(homepageIssueMessage(result.error).length > 0);
}

reject({ ...defaultHomepageContent, collections: [] }, "empty collections");
reject(
  {
    ...defaultHomepageContent,
    hero: {
      ...defaultHomepageContent.hero,
      primaryCta: { label: "Explore", href: "javascript:alert(1)" },
    },
  },
  "javascript link",
);
reject(
  {
    ...defaultHomepageContent,
    hero: { ...defaultHomepageContent.hero, imageUrl: "//images.example/hero.jpg" },
  },
  "protocol-relative image",
);
reject(
  {
    ...defaultHomepageContent,
    hero: { ...defaultHomepageContent.hero, imageUrl: "data:image/png;base64,aaaa" },
  },
  "data image",
);

const sitePath = homepageContentSchema.safeParse({
  ...defaultHomepageContent,
  hero: { ...defaultHomepageContent.hero, primaryCta: { label: "Shop", href: "  /shop  " } },
});
assert.equal(sitePath.success, true);
if (sitePath.success) assert.equal(sitePath.data.hero.primaryCta.href, "/shop");

console.log("homepage content tests passed");
