import "reflect-metadata";

import assert from "node:assert/strict";

import {
  campaignAppliesTo,
  campaignBanner,
  campaignIsLive,
  campaignWindow,
  effectiveUnitPrice,
  promoDiscount,
  promoRejection,
  quoteTotals,
  type CampaignRule,
  type PromoRule,
} from "@abeera/shared";

const start = new Date("2026-11-01T00:00:00.000Z");
const end = new Date("2026-11-08T00:00:00.000Z");

function campaign(overrides: Partial<CampaignRule> = {}): CampaignRule {
  return {
    id: "sale-1",
    name: "Eid",
    discountType: "PERCENT",
    amount: 20,
    startsAt: start,
    endsAt: end,
    active: true,
    scope: "ALL",
    categoryIds: [],
    productIds: [],
    bannerText: "",
    ...overrides,
  };
}

function promo(overrides: Partial<PromoRule> = {}): PromoRule {
  return {
    code: "ABEERA10",
    discountType: "PERCENT",
    amount: 10,
    minSubtotal: 0,
    startsAt: null,
    expiresAt: null,
    usageLimit: null,
    usedCount: 0,
    active: true,
    ...overrides,
  };
}

const during = new Date("2026-11-04T12:00:00.000Z");
const product = { productId: "p1", categoryId: "c1" };

assert.equal(campaignWindow(campaign(), new Date(start.getTime() - 1)), "scheduled");
assert.equal(campaignIsLive(campaign(), start), true);
assert.equal(campaignWindow(campaign(), new Date(end.getTime() - 1)), "live");
assert.equal(campaignWindow(campaign(), end), "ended");
assert.equal(campaignWindow(campaign(), new Date(end.getTime() + 1)), "ended");
assert.equal(campaignWindow(campaign({ active: false }), during), "paused");
assert.equal(campaignIsLive(campaign({ active: false }), during), false);
assert.equal(campaignWindow(campaign({ endsAt: start }), during), "ended");

assert.equal(campaignAppliesTo(campaign({ scope: "ALL" }), product), true);
assert.equal(
  campaignAppliesTo(campaign({ scope: "CATEGORIES", categoryIds: ["c1"] }), product),
  true,
);
assert.equal(
  campaignAppliesTo(campaign({ scope: "CATEGORIES", categoryIds: ["other"] }), product),
  false,
);
assert.equal(
  campaignAppliesTo(campaign({ scope: "PRODUCTS", productIds: ["p1"] }), product),
  true,
);
assert.equal(
  campaignAppliesTo(campaign({ scope: "PRODUCTS", productIds: ["p2"] }), product),
  false,
);

const shelf = {
  priceInPaisa: 200_000,
  compareAtPrice: null as number | null,
  productId: "p1",
  categoryId: "c1",
};

assert.deepEqual(effectiveUnitPrice({ ...shelf, campaigns: [campaign({ startsAt: end })], now: during }), {
  price: 200_000,
  compareAt: null,
  onSale: false,
  campaignId: null,
});

const percent = effectiveUnitPrice({ ...shelf, campaigns: [campaign()], now: during });
assert.equal(percent.price, 160_000);
assert.equal(percent.compareAt, 200_000);
assert.equal(percent.onSale, true);
assert.equal(percent.campaignId, "sale-1");

const fixed = effectiveUnitPrice({
  ...shelf,
  campaigns: [campaign({ id: "fixed", discountType: "FIXED", amount: 50_000 })],
  now: during,
});
assert.equal(fixed.price, 150_000);

const best = effectiveUnitPrice({
  ...shelf,
  campaigns: [
    campaign({ id: "small", amount: 10 }),
    campaign({ id: "large", amount: 25, scope: "PRODUCTS", productIds: ["p1"] }),
    campaign({ id: "other", amount: 50, scope: "PRODUCTS", productIds: ["p2"] }),
  ],
  now: during,
});
assert.equal(best.price, 150_000);
assert.equal(best.campaignId, "large");

const stacked = effectiveUnitPrice({
  ...shelf,
  compareAtPrice: 250_000,
  campaigns: [campaign({ amount: 10 })],
  now: during,
});
assert.equal(stacked.price, 180_000);
assert.equal(stacked.compareAt, 250_000);

const missed = effectiveUnitPrice({
  ...shelf,
  campaigns: [campaign({ scope: "CATEGORIES", categoryIds: ["c2"] })],
  now: during,
});
assert.equal(missed.onSale, false);

assert.equal(campaignBanner([campaign({ bannerText: "  " })], during), null);
assert.equal(
  campaignBanner(
    [
      campaign({ id: "narrow", scope: "PRODUCTS", productIds: ["p1"], bannerText: "One piece", startsAt: during }),
      campaign({ id: "wide", scope: "ALL", bannerText: "Shop sale", startsAt: start }),
    ],
    during,
  ),
  "Shop sale",
);

const open = promo();
assert.equal(promoRejection(open, 200_000, during), null);
assert.equal(promoDiscount(open, 200_000), 20_000);
assert.equal(promoRejection(promo({ active: false }), 200_000, during), "This code isn't active");
assert.equal(
  promoRejection(promo({ startsAt: new Date(during.getTime() + 1000) }), 200_000, during),
  "This code isn't active yet",
);
assert.equal(promoRejection(promo({ expiresAt: during }), 200_000, during), "This code has expired");
assert.equal(
  promoRejection(promo({ usageLimit: 1, usedCount: 1 }), 200_000, during),
  "This code has reached its usage limit",
);
assert.equal(
  promoRejection(promo({ minSubtotal: 300_000 }), 200_000, during),
  "This code needs a higher order total",
);
assert.equal(promoDiscount(promo({ discountType: "FIXED", amount: 50_000 }), 200_000), 50_000);
assert.equal(promoDiscount(promo({ discountType: "FIXED", amount: 900_000 }), 200_000), 200_000);

const quoted = quoteTotals({ subtotal: 200_000, shippingMethod: "standard", promo: open, now: during });
assert.equal(quoted.ok, true);
if (quoted.ok) {
  assert.equal(quoted.discount, 20_000);
  assert.equal(quoted.promoCode, "ABEERA10");
  assert.equal(quoted.shipping, 30_000);
  assert.equal(quoted.total, 210_000);
}
const refused = quoteTotals({
  subtotal: 200_000,
  shippingMethod: "standard",
  promo: promo({ active: false }),
  now: during,
});
assert.equal(refused.ok, false);
const plain = quoteTotals({ subtotal: 200_000, shippingMethod: "standard", now: during });
assert.equal(plain.ok, true);
if (plain.ok) assert.equal(plain.discount, 0);

console.log("sales rule tests passed");
