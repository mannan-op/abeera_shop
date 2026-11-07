"use server";

import { cookies } from "next/headers";

import { API_URL } from "@/lib/auth/cookies";
import type { CartItem } from "@/lib/catalog/types";

/** Remembers the last order on this browser so /order-confirmation can show it without an account. */
const LAST_ORDER_COOKIE = "abeera_last_order";

export type PlaceOrderInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  paymentMethod: "COD" | "JAZZCASH" | "EASYPAISA";
  shippingMethod: "standard" | "express";
  promoCode?: string;
  idempotencyKey: string;
  items: CartItem[];
};

type Fail = { ok: false; error: string };

async function readError(res: Response, fallback: string) {
  const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
  return Array.isArray(body.message) ? body.message.join(", ") : (body.message ?? fallback);
}

/** Guest checkout: resolves variants, then one public POST /orders. */
export async function placeOrder(input: PlaceOrderInput): Promise<{ ok: true; orderNumber: string } | Fail> {
  const items: { variantId: string; quantity: number }[] = [];
  for (const item of input.items) {
    let variantId = item.variantId;
    if (!variantId) {
      const res = await fetch(`${API_URL}/products/${encodeURIComponent(item.slug)}`, { cache: "no-store" });
      if (!res.ok) return { ok: false, error: `Could not find ${item.name}. Please remove it from your bag.` };
      const product = (await res.json()) as { variants: { id: string; color: string; size: string }[] };
      variantId = product.variants.find((v) => v.color === item.color && v.size === item.size)?.id;
      if (!variantId) return { ok: false, error: `Size/colour unavailable for ${item.name}` };
    }
    items.push({ variantId, quantity: item.quantity });
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: `${input.firstName} ${input.lastName}`.trim(),
          email: input.email,
          phone: input.phone,
        },
        address: {
          line1: input.line1,
          city: input.city,
          region: input.region,
          postalCode: input.postalCode,
          country: "Pakistan",
        },
        items,
        paymentMethod: input.paymentMethod,
        shippingMethod: input.shippingMethod,
        promoCode: input.promoCode || undefined,
        idempotencyKey: input.idempotencyKey,
      }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "We couldn't reach the shop. Please try again in a moment." };
  }
  if (!res.ok) return { ok: false, error: await readError(res, "Could not place order") };
  const order = (await res.json()) as { orderNumber: string; customerEmail: string };

  (await cookies()).set(LAST_ORDER_COOKIE, JSON.stringify({ n: order.orderNumber, e: order.customerEmail }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true, orderNumber: order.orderNumber };
}

export type TrackedOrder = {
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  shippingMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string | null;
  customerName: string;
  city: string;
  items: { productName: string; productSlug: string; productImage: string | null; color: string; size: string; price: number; quantity: number }[];
};

export async function lookupOrder(orderNumber: string, email: string): Promise<{ ok: true; order: TrackedOrder } | Fail> {
  try {
    const res = await fetch(`${API_URL}/orders/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, email }),
      cache: "no-store",
    });
    if (res.status === 429) return { ok: false, error: "Too many attempts. Please wait a minute and try again." };
    if (!res.ok) return { ok: false, error: await readError(res, "We couldn't find that order.") };
    return { ok: true, order: (await res.json()) as TrackedOrder };
  } catch {
    return { ok: false, error: "We couldn't reach the shop. Please try again in a moment." };
  }
}

/** The order this browser just placed, for the confirmation page. */
export async function lastPlacedOrder(orderNumber: string) {
  const raw = (await cookies()).get(LAST_ORDER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as { n: string; e: string };
    if (saved.n !== orderNumber) return null;
    const res = await lookupOrder(saved.n, saved.e);
    return res.ok ? { order: res.order, email: saved.e } : null;
  } catch {
    return null;
  }
}
