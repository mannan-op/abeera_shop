import "reflect-metadata";

import assert from "node:assert/strict";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PrismaClient } from "@prisma/client";

import { AppModule } from "../src/app.module";
import { configureApp } from "../src/main";

async function main() {
  const prisma = new PrismaClient();
  const run = `s${Date.now().toString(36)}`;
  const adminEmail = `${run}-admin@abeera.test`;
  const password = "test-password-1";
  let app: INestApplication | undefined;
  const categoryIds: string[] = [];
  const productIds: string[] = [];
  const campaignIds: string[] = [];
  const promoIds: string[] = [];

  try {
    app = await NestFactory.create(AppModule, { logger: ["error"] });
    configureApp(app);
    await app.listen(0, "127.0.0.1");
    const httpAddress = app.getHttpServer().address();
    const port = typeof httpAddress === "object" && httpAddress ? httpAddress.port : 0;
    const base = `http://127.0.0.1:${port}/api`;

    await json(base, "/auth/register", {
      method: "POST",
      body: { name: "Sales Admin", email: adminEmail, password },
    });
    await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
    const adminLogin = await json(base, "/auth/login", {
      method: "POST",
      body: { email: adminEmail, password },
    });
    assert.equal(adminLogin.status, 200);
    const token = (adminLogin.body as { accessToken: string }).accessToken;

    const catA = await prisma.category.create({ data: { slug: `${run}-a`, name: "Sale cat A" } });
    const catB = await prisma.category.create({ data: { slug: `${run}-b`, name: "Sale cat B" } });
    categoryIds.push(catA.id, catB.id);
    const productA = await prisma.product.create({
      data: {
        slug: `${run}-a`,
        name: `${run} Piece A`,
        categoryId: catA.id,
        variants: { create: { color: "Ivory", size: "M", priceInPaisa: 200000, stock: 5 } },
      },
      include: { variants: true },
    });
    const productB = await prisma.product.create({
      data: {
        slug: `${run}-b`,
        name: `${run} Piece B`,
        categoryId: catB.id,
        variants: { create: { color: "Black", size: "M", priceInPaisa: 100000, stock: 5 } },
      },
      include: { variants: true },
    });
    productIds.push(productA.id, productB.id);
    const variantA = productA.variants[0].id;

    const future = await json(base, "/admin/sales", {
      method: "POST",
      token,
      body: {
        name: `${run} later`,
        discountType: "PERCENT",
        amount: 20,
        startsAt: new Date(Date.now() + 86_400_000).toISOString(),
        endsAt: new Date(Date.now() + 172_800_000).toISOString(),
        active: true,
        scope: "ALL",
        categoryIds: [],
        productIds: [],
        bannerText: "Not yet",
      },
    });
    assert.equal(future.status, 201, JSON.stringify(future.body));
    const campaignId = (future.body as { id: string; status: string }).id;
    campaignIds.push(campaignId);
    assert.equal((future.body as { status: string }).status, "scheduled");
    assert.equal(await priceOf(base, productA.slug), 200000);
    assert.equal((await banner(base)).text, null);

    const narrowed = await json(base, `/admin/sales/${campaignId}`, {
      method: "PATCH",
      token,
      body: {
        startsAt: new Date(Date.now() - 60_000).toISOString(),
        endsAt: new Date(Date.now() + 3_600_000).toISOString(),
        scope: "PRODUCTS",
        productIds: [productA.id],
        amount: 10,
        bannerText: `${run} banner`,
      },
    });
    assert.equal(narrowed.status, 200, JSON.stringify(narrowed.body));
    assert.equal((narrowed.body as { status: string }).status, "live");
    assert.equal(await priceOf(base, productA.slug), 180000);
    assert.equal(await compareOf(base, productA.slug), 200000);
    assert.equal(await priceOf(base, productB.slug), 100000);
    assert.equal(await compareOf(base, productB.slug), null);

    const onSale = await json(base, `/products?onSale=true&search=${run}`);
    assert.equal(onSale.status, 200);
    const saleIds = ((onSale.body as { items: { id: string }[] }).items).map((item) => item.id);
    assert.equal(saleIds.includes(productA.id), true);
    assert.equal(saleIds.includes(productB.id), false);
    assert.equal((await banner(base)).text, `${run} banner`);

    const byCategory = await json(base, `/admin/sales/${campaignId}`, {
      method: "PATCH",
      token,
      body: { scope: "CATEGORIES", categoryIds: [catB.id], productIds: [] },
    });
    assert.equal(byCategory.status, 200, JSON.stringify(byCategory.body));
    assert.equal(await priceOf(base, productA.slug), 200000);
    assert.equal(await priceOf(base, productB.slug), 90000);
    assert.equal(await compareOf(base, productB.slug), 100000);

    const everyone = await json(base, `/admin/sales/${campaignId}`, {
      method: "PATCH",
      token,
      body: { scope: "ALL", categoryIds: [], productIds: [] },
    });
    assert.equal(everyone.status, 200);
    assert.equal(await priceOf(base, productA.slug), 180000);
    assert.equal(await priceOf(base, productB.slug), 90000);

    const ended = await json(base, `/admin/sales/${campaignId}/end`, { method: "POST", token, body: {} });
    assert.equal(ended.status, 201, JSON.stringify(ended.body));
    assert.equal((ended.body as { status: string }).status, "ended");
    assert.equal(await priceOf(base, productA.slug), 200000);
    assert.equal((await banner(base)).text, null);

    const paused = await json(base, "/admin/sales", {
      method: "POST",
      token,
      body: {
        name: `${run} paused`,
        discountType: "FIXED",
        amount: 10000,
        startsAt: new Date(Date.now() - 60_000).toISOString(),
        endsAt: new Date(Date.now() + 3_600_000).toISOString(),
        active: false,
        scope: "ALL",
        categoryIds: [],
        productIds: [],
        bannerText: "",
      },
    });
    assert.equal(paused.status, 201, JSON.stringify(paused.body));
    campaignIds.push((paused.body as { id: string }).id);
    assert.equal((paused.body as { status: string }).status, "paused");
    assert.equal(await priceOf(base, productA.slug), 200000);

    const below = await createPromo(base, token, {
      code: `${run}MIN`.toUpperCase(),
      minSubtotal: 500000,
      active: true,
    });
    promoIds.push(below);
    const belowOrder = await order(base, `${run}-below@abeera.test`, variantA, `${run}-min`, `${run}MIN`.toUpperCase());
    assert.equal(belowOrder.status, 400);
    assert.match(JSON.stringify(belowOrder.body), /higher order total/);

    const inactive = await createPromo(base, token, { code: `${run}OFF`.toUpperCase(), active: false });
    promoIds.push(inactive);
    const inactiveOrder = await order(base, `${run}-off@abeera.test`, variantA, `${run}-off`, `${run}OFF`.toUpperCase());
    assert.equal(inactiveOrder.status, 400);
    assert.match(JSON.stringify(inactiveOrder.body), /isn't active/);

    const expired = await createPromo(base, token, {
      code: `${run}OLD`.toUpperCase(),
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });
    promoIds.push(expired);
    const expiredOrder = await order(base, `${run}-old@abeera.test`, variantA, `${run}-old`, `${run}OLD`.toUpperCase());
    assert.equal(expiredOrder.status, 400);
    assert.match(JSON.stringify(expiredOrder.body), /expired/);

    const waiting = await createPromo(base, token, {
      code: `${run}SOON`.toUpperCase(),
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    promoIds.push(waiting);
    const waitingOrder = await order(base, `${run}-soon@abeera.test`, variantA, `${run}-soon`, `${run}SOON`.toUpperCase());
    assert.equal(waitingOrder.status, 400);
    assert.match(JSON.stringify(waitingOrder.body), /isn't active yet/);

    const limitedId = await createPromo(base, token, {
      code: `${run}ONCE`.toUpperCase(),
      usageLimit: 1,
      discountType: "FIXED",
      amount: 5000,
    });
    promoIds.push(limitedId);
    const email = `${run}-once@abeera.test`;
    const first = await order(base, email, variantA, `${run}-once`, `${run}ONCE`.toUpperCase());
    assert.equal(first.status, 201, JSON.stringify(first.body));
    const placed = first.body as { discount: number; total: number };
    assert.equal(placed.discount, 5000);
    assert.equal(placed.total, 200000 - 5000 + 30000);
    assert.equal((await prisma.promoCode.findUniqueOrThrow({ where: { id: limitedId } })).usedCount, 1);

    const second = await order(base, email, variantA, `${run}-twice`, `${run}ONCE`.toUpperCase());
    assert.equal(second.status, 400);
    assert.match(JSON.stringify(second.body), /usage limit/);
    assert.equal((await prisma.promoCode.findUniqueOrThrow({ where: { id: limitedId } })).usedCount, 1);

    const replay = await order(base, email, variantA, `${run}-once`, `${run}ONCE`.toUpperCase());
    assert.equal(replay.status, 201);
    assert.equal((replay.body as { id: string }).id, (first.body as { id: string }).id);
    assert.equal((await prisma.promoCode.findUniqueOrThrow({ where: { id: limitedId } })).usedCount, 1);

    const quote = await json(base, "/orders/quote", {
      method: "POST",
      body: {
        items: [{ variantId: variantA, quantity: 1 }],
        shippingMethod: "standard",
        promoCode: "NO-SUCH-CODE",
      },
    });
    assert.equal(quote.status, 400);
    assert.match(JSON.stringify(quote.body), /Unknown promo code/);

    console.log("sales integration tests passed");
  } finally {
    await prisma.payment.deleteMany({ where: { order: { customerEmail: { contains: run } } } });
    await prisma.orderItem.deleteMany({ where: { order: { customerEmail: { contains: run } } } });
    await prisma.order.deleteMany({ where: { customerEmail: { contains: run } } });
    if (promoIds.length) await prisma.promoCode.deleteMany({ where: { id: { in: promoIds } } });
    if (campaignIds.length) await prisma.saleCampaign.deleteMany({ where: { id: { in: campaignIds } } });
    if (productIds.length) {
      await prisma.productVariant.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    }
    if (categoryIds.length) await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
    await prisma.user.deleteMany({ where: { email: adminEmail } });
    await app?.close();
    await prisma.$disconnect();
  }
}

async function createPromo(
  base: string,
  token: string,
  input: {
    code: string;
    active?: boolean;
    minSubtotal?: number;
    usageLimit?: number;
    discountType?: "PERCENT" | "FIXED";
    amount?: number;
    startsAt?: string;
    expiresAt?: string;
  },
) {
  const created = await json(base, "/admin/promos", {
    method: "POST",
    token,
    body: {
      discountType: "PERCENT",
      amount: 10,
      minSubtotal: 0,
      active: true,
      startsAt: null,
      expiresAt: null,
      usageLimit: null,
      ...input,
    },
  });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  return (created.body as { id: string }).id;
}

async function order(base: string, email: string, variantId: string, idempotencyKey: string, promoCode?: string) {
  return json(base, "/orders", {
    method: "POST",
    body: {
      customer: { name: "Sale Customer", email, phone: "03001234567" },
      address: {
        line1: "1 Test Road",
        city: "Lahore",
        region: "Punjab",
        postalCode: "54000",
        country: "Pakistan",
      },
      items: [{ variantId, quantity: 1 }],
      paymentMethod: "COD",
      shippingMethod: "standard",
      promoCode,
      idempotencyKey,
    },
  });
}

async function priceOf(base: string, slug: string) {
  const res = await json(base, `/products/${slug}`);
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const variants = (res.body as { variants: { priceInPaisa: number }[] }).variants;
  return Math.min(...variants.map((variant) => variant.priceInPaisa));
}

async function compareOf(base: string, slug: string) {
  const res = await json(base, `/products/${slug}`);
  const variants = (res.body as { variants: { compareAtPrice: number | null }[] }).variants;
  return variants[0]?.compareAtPrice ?? null;
}

async function banner(base: string) {
  const res = await json(base, "/sales/banner");
  assert.equal(res.status, 200);
  return res.body as { text: string | null };
}

async function json(
  base: string,
  path: string,
  init: { method?: string; token?: string; body?: unknown } = {},
) {
  const res = await fetch(`${base}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: res.status, body };
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
