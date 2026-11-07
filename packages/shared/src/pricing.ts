import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS, type ShippingMethodId } from "./constants";

export type OrderQuote =
  | {
      ok: true;
      shippingMethod: ShippingMethodId;
      promoCode: string | null;
      shipping: number;
      discount: number;
      tax: number;
      total: number;
    }
  | { ok: false; error: string };

export type ShippingRates = { standard: number; express: number; freeThreshold: number };

export const DEFAULT_SHIPPING_RATES: ShippingRates = {
  standard: SHIPPING_METHODS.standard,
  express: SHIPPING_METHODS.express,
  freeThreshold: FREE_SHIPPING_THRESHOLD,
};

export type DiscountKind = "PERCENT" | "FIXED";
export type CampaignScope = "ALL" | "CATEGORIES" | "PRODUCTS";
export type CampaignWindow = "scheduled" | "live" | "ended" | "paused";

/** A sale campaign as the shop and the API both understand it. Amounts are paisa, or a percent. */
export type CampaignRule = {
  id: string;
  name?: string;
  discountType: DiscountKind;
  /** Percent 1–100, or a fixed discount in paisa. */
  amount: number;
  startsAt: Date | string;
  endsAt: Date | string;
  active: boolean;
  scope: CampaignScope;
  categoryIds: string[];
  productIds: string[];
  bannerText?: string;
};

export type PromoRule = {
  code: string;
  discountType: DiscountKind;
  /** Percent 1–100, or a fixed discount in paisa, applied to the merchandise subtotal. */
  amount: number;
  minSubtotal: number;
  startsAt: Date | string | null;
  expiresAt: Date | string | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
};

export type PricedUnit = {
  /** What the customer pays for one piece, in paisa. */
  price: number;
  /** Crossed-out original, when it is higher than `price`. */
  compareAt: number | null;
  onSale: boolean;
  campaignId: string | null;
};

const SCOPE_RANK: Record<CampaignScope, number> = {
  ALL: 0,
  CATEGORIES: 1,
  PRODUCTS: 2,
};

export function campaignWindow(
  campaign: Pick<CampaignRule, "active" | "startsAt" | "endsAt">,
  now: Date = new Date(),
): CampaignWindow {
  const start = new Date(campaign.startsAt).getTime();
  const end = new Date(campaign.endsAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return campaign.active ? "ended" : "paused";
  }
  if (!campaign.active) return "paused";
  const t = now.getTime();
  if (t < start) return "scheduled";
  if (t >= end) return "ended";
  return "live";
}

export function campaignIsLive(campaign: Pick<CampaignRule, "active" | "startsAt" | "endsAt">, now: Date = new Date()) {
  return campaignWindow(campaign, now) === "live";
}

export function campaignAppliesTo(
  campaign: Pick<CampaignRule, "scope" | "categoryIds" | "productIds">,
  target: { productId: string; categoryId: string },
) {
  switch (campaign.scope) {
    case "ALL":
      return true;
    case "CATEGORIES":
      return campaign.categoryIds.includes(target.categoryId);
    case "PRODUCTS":
      return campaign.productIds.includes(target.productId);
    default: {
      const unreachable: never = campaign.scope;
      return unreachable;
    }
  }
}

/** Paisa taken off `price`. Never more than the price itself. */
export function discountAmount(price: number, type: DiscountKind, amount: number) {
  if (price <= 0 || amount <= 0) return 0;
  switch (type) {
    case "PERCENT": {
      const percent = Math.min(100, amount);
      return Math.min(price, Math.round((price * percent) / 100));
    }
    case "FIXED":
      return Math.min(price, amount);
    default: {
      const unreachable: never = type;
      return unreachable;
    }
  }
}

/**
 * Selling price after the best live campaign. A manual compare-at price stays
 * the crossed-out original when it is already above the shelf price; otherwise
 * the shelf price is crossed out once a campaign lowers it.
 * Campaigns do not stack — the customer pays the lowest result.
 */
export function effectiveUnitPrice(input: {
  priceInPaisa: number;
  compareAtPrice: number | null;
  productId: string;
  categoryId: string;
  campaigns: CampaignRule[];
  now?: Date;
}): PricedUnit {
  const now = input.now ?? new Date();
  let bestOff = 0;
  let campaignId: string | null = null;
  for (const campaign of input.campaigns) {
    if (!campaignIsLive(campaign, now)) continue;
    if (!campaignAppliesTo(campaign, { productId: input.productId, categoryId: input.categoryId })) continue;
    const off = discountAmount(input.priceInPaisa, campaign.discountType, campaign.amount);
    if (off > bestOff) {
      bestOff = off;
      campaignId = campaign.id;
    }
  }
  const price = Math.max(0, input.priceInPaisa - bestOff);
  const manualOriginal =
    input.compareAtPrice != null && input.compareAtPrice > input.priceInPaisa
      ? input.compareAtPrice
      : input.priceInPaisa;
  const compareAt = manualOriginal > price ? manualOriginal : null;
  return { price, compareAt, onSale: compareAt != null, campaignId };
}

/** Banner copy from the broadest live campaign that has any. */
export function campaignBanner(campaigns: CampaignRule[], now: Date = new Date()): string | null {
  const live = campaigns.filter((campaign) => campaignIsLive(campaign, now) && (campaign.bannerText ?? "").trim());
  live.sort((a, b) => {
    const scope = SCOPE_RANK[a.scope] - SCOPE_RANK[b.scope];
    if (scope !== 0) return scope;
    return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
  });
  const text = live[0]?.bannerText?.trim();
  return text ? text : null;
}

/** Why a code cannot be used, or null when it can. */
export function promoRejection(promo: PromoRule, subtotal: number, now: Date = new Date()): string | null {
  if (!promo.active) return "This code isn't active";
  const t = now.getTime();
  if (promo.startsAt != null && t < new Date(promo.startsAt).getTime()) return "This code isn't active yet";
  if (promo.expiresAt != null && t >= new Date(promo.expiresAt).getTime()) return "This code has expired";
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) return "This code has reached its usage limit";
  if (promo.minSubtotal > 0 && subtotal < promo.minSubtotal) return "This code needs a higher order total";
  return null;
}

export function promoDiscount(promo: PromoRule, subtotal: number) {
  return discountAmount(subtotal, promo.discountType, promo.amount);
}

export function quoteTotals(input: {
  subtotal: number;
  shippingMethod: string;
  /** Already loaded from the database. Omit when the customer did not enter a code. */
  promo?: PromoRule | null;
  rates?: ShippingRates;
  now?: Date;
}): OrderQuote {
  const rates = input.rates ?? DEFAULT_SHIPPING_RATES;
  if (!isShippingMethod(input.shippingMethod)) {
    return { ok: false, error: "Unknown shipping method" };
  }

  const now = input.now ?? new Date();
  let discount = 0;
  let promoCode: string | null = null;
  if (input.promo) {
    const reason = promoRejection(input.promo, input.subtotal, now);
    if (reason) return { ok: false, error: reason };
    discount = promoDiscount(input.promo, input.subtotal);
    promoCode = input.promo.code;
  }

  const shipping =
    input.shippingMethod === "standard" && rates.freeThreshold > 0 && input.subtotal >= rates.freeThreshold
      ? 0
      : rates[input.shippingMethod];
  const tax = 0;

  return {
    ok: true,
    shippingMethod: input.shippingMethod,
    promoCode,
    shipping,
    discount,
    tax,
    total: input.subtotal - discount + shipping + tax,
  };
}

function isShippingMethod(value: string): value is ShippingMethodId {
  return Object.prototype.hasOwnProperty.call(SHIPPING_METHODS, value);
}
