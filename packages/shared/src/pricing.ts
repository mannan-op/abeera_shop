import {
  FREE_SHIPPING_THRESHOLD,
  PROMO_CODES,
  SHIPPING_METHODS,
  type ShippingMethodId,
} from "./constants";

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

export function quoteTotals(input: {
  subtotal: number;
  shippingMethod: string;
  promoCode?: string | null;
}): OrderQuote {
  if (!isShippingMethod(input.shippingMethod)) {
    return { ok: false, error: "Unknown shipping method" };
  }

  const promo = resolvePromo(input.promoCode);
  if (!promo.ok) return promo;

  const shipping =
    input.shippingMethod === "standard" && input.subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_METHODS[input.shippingMethod];
  const discount = promo.percent
    ? Math.min(input.subtotal, Math.round((input.subtotal * promo.percent) / 100))
    : 0;
  const tax = 0;

  return {
    ok: true,
    shippingMethod: input.shippingMethod,
    promoCode: promo.code,
    shipping,
    discount,
    tax,
    total: input.subtotal - discount + shipping + tax,
  };
}

function isShippingMethod(value: string): value is ShippingMethodId {
  return Object.prototype.hasOwnProperty.call(SHIPPING_METHODS, value);
}

function resolvePromo(
  raw?: string | null,
): { ok: true; code: string | null; percent: number } | { ok: false; error: string } {
  const code = raw?.trim().toUpperCase() ?? "";
  if (!code) return { ok: true, code: null, percent: 0 };
  const percent = PROMO_CODES[code];
  if (percent == null) return { ok: false, error: "Unknown promo code" };
  return { ok: true, code, percent };
}
