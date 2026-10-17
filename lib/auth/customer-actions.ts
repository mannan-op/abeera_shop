"use server";

import { API_URL } from "@/lib/auth/cookies";
import { ensureAccessToken, writeSessionCookies } from "@/lib/auth/session";
import type { CartItem } from "@/lib/catalog/types";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; role: string };
};

async function setCustomerSession(tokens: AuthTokens) {
  await writeSessionCookies(tokens);
}

export async function customerLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { ok: false as const, error: (body.message as string) ?? "Invalid credentials" };
  }
  const data = (await res.json()) as AuthTokens;
  await setCustomerSession(data);
  return { ok: true as const, user: data.user };
}

export async function customerRegister(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : ((body.message as string) ?? "Could not create account");
    return { ok: false as const, error: message };
  }
  const data = (await res.json()) as AuthTokens;
  await setCustomerSession(data);
  return { ok: true as const, user: data.user };
}

export async function getCustomerAccessToken() {
  return ensureAccessToken();
}

export type PlaceOrderInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  paymentMethod: "COD" | "JAZZCASH" | "EASYPAISA";
  shippingMethod: "standard" | "express";
  promoCode?: string;
  idempotencyKey: string;
  items: CartItem[];
};

export async function placeOrder(input: PlaceOrderInput) {
  const token = await getCustomerAccessToken();
  if (!token) {
    return { ok: false as const, error: "Please sign in to place an order.", code: "UNAUTH" as const };
  }

  const missingVariant = input.items.find((item) => !item.variantId);
  const resolvedItems = [...input.items];

  if (missingVariant) {
    for (let i = 0; i < resolvedItems.length; i++) {
      const item = resolvedItems[i];
      if (item.variantId) continue;
      const bySlug = await fetch(`${API_URL}/products/${item.slug}`, {
        cache: "no-store",
      });
      if (!bySlug.ok) {
        return {
          ok: false as const,
          error: `Could not resolve variant for ${item.name}`,
          code: "VARIANT" as const,
        };
      }
      const product = (await bySlug.json()) as {
        variants: { id: string; color: string; size: string }[];
      };
      const variant = product.variants.find(
        (v) => v.color === item.color && v.size === item.size,
      );
      if (!variant) {
        return {
          ok: false as const,
          error: `Size/colour unavailable for ${item.name}`,
          code: "VARIANT" as const,
        };
      }
      resolvedItems[i] = { ...item, variantId: variant.id };
    }
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const addressRes = await fetch(`${API_URL}/users/me/addresses`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      label: "Checkout",
      name: `${input.firstName} ${input.lastName}`.trim(),
      line1: input.line1,
      city: input.city,
      region: input.region,
      postalCode: input.postalCode,
      country: input.country,
      phone: input.phone,
    }),
    cache: "no-store",
  });
  if (!addressRes.ok) {
    const body = await addressRes.json().catch(() => ({}));
    return {
      ok: false as const,
      error: (body.message as string) ?? "Could not save address",
      code: "ADDRESS" as const,
    };
  }
  const address = (await addressRes.json()) as { id: string };

  await fetch(`${API_URL}/cart`, { method: "DELETE", headers, cache: "no-store" }).catch(
    () => undefined,
  );

  for (const item of resolvedItems) {
    const addRes = await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers,
      body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }),
      cache: "no-store",
    });
    if (!addRes.ok) {
      const body = await addRes.json().catch(() => ({}));
      return {
        ok: false as const,
        error: (body.message as string) ?? `Could not add ${item.name} to cart`,
        code: "CART" as const,
      };
    }
  }

  const orderRes = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      addressId: address.id,
      paymentMethod: input.paymentMethod,
      shippingMethod: input.shippingMethod,
      promoCode: input.promoCode,
      idempotencyKey: input.idempotencyKey,
    }),
    cache: "no-store",
  });
  if (!orderRes.ok) {
    const body = await orderRes.json().catch(() => ({}));
    return {
      ok: false as const,
      error: (body.message as string) ?? "Could not place order",
      code: "ORDER" as const,
    };
  }

  const order = (await orderRes.json()) as {
    id: string;
    orderNumber: string;
    total: number;
    shipping: number;
    address: { line1: string; city: string };
    items: { productName: string; color: string; quantity: number }[];
  };

  return {
    ok: true as const,
    order: {
      id: order.id,
      number: order.orderNumber,
      email: input.email,
      total: order.total,
      shipping: order.shipping === 0 ? "Complimentary" : "Standard",
      address: `${order.address.line1}, ${order.address.city}`,
      estimatedDelivery: "3–7 business days",
      items: input.items,
    },
  };
}
