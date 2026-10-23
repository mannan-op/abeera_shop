import "reflect-metadata";

import assert from "node:assert/strict";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PrismaClient } from "@prisma/client";

import { AppModule } from "../src/app.module";
import { configureApp } from "../src/main";

async function main() {

  const prisma = new PrismaClient();
  const run = `t${Date.now().toString(36)}`;
  const customerEmail = `${run}-customer@abeera.test`;
  const adminEmail = `${run}-admin@abeera.test`;
  const password = "test-password-1";
  let app: INestApplication | undefined;
  let categoryId = "";
  let productId = "";
  let variantId = "";

  try {
    app = await NestFactory.create(AppModule, { logger: ["error"] });
    configureApp(app);
    await app.listen(0, "127.0.0.1");
    const httpAddress = app.getHttpServer().address();
    const port = typeof httpAddress === "object" && httpAddress ? httpAddress.port : 0;
    const base = `http://127.0.0.1:${port}/api`;

    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    const healthBody = (await health.json()) as { database: string; redis: string };
    assert.equal(healthBody.database, "up");
    assert.equal(healthBody.redis, "up");

    const customer = await json(base, "/auth/register", {
      method: "POST",
      body: { name: "Test Customer", email: customerEmail, password },
    });
    assert.equal(customer.status, 201);
    const customerTokens = customer.body as Tokens;
    assert.ok(customerTokens.accessToken);

    const registeredAdmin = await json(base, "/auth/register", {
      method: "POST",
      body: { name: "Test Admin", email: adminEmail, password },
    });
    assert.equal(registeredAdmin.status, 201);
    await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
    const adminLogin = await json(base, "/auth/login", {
      method: "POST",
      body: { email: adminEmail, password },
    });
    assert.equal(adminLogin.status, 200);
    const adminTokens = adminLogin.body as Tokens;
    assert.equal(adminTokens.user.role, "ADMIN");

    const customerAdmin = await json(base, "/admin/dashboard", {
      token: customerTokens.accessToken,
    });
    assert.equal(customerAdmin.status, 403);
    const adminDash = await json(base, "/admin/dashboard", { token: adminTokens.accessToken });
    assert.equal(adminDash.status, 200);

    const rotated = await json(base, "/auth/refresh", {
      method: "POST",
      body: { refreshToken: customerTokens.refreshToken },
    });
    assert.equal(rotated.status, 200);
    const nextTokens = rotated.body as Tokens;
    assert.notEqual(nextTokens.refreshToken, customerTokens.refreshToken);
    const reused = await json(base, "/auth/refresh", {
      method: "POST",
      body: { refreshToken: customerTokens.refreshToken },
    });
    assert.equal(reused.status, 401);
    customerTokens.accessToken = nextTokens.accessToken;
    customerTokens.refreshToken = nextTokens.refreshToken;

    const unsigned = await json(base, "/payments/webhook", {
      method: "POST",
      body: { pp_TxnRefNo: "unsigned-txn" },
    });
    assert.equal(unsigned.status, 401);

    const category = await prisma.category.create({
      data: { slug: `${run}-cat`, name: "Test category" },
    });
    categoryId = category.id;
    const product = await prisma.product.create({
      data: {
        slug: `${run}-piece`,
        name: "Test piece",
        categoryId: category.id,
        variants: {
          create: {
            color: "Black",
            colorHex: "#111111",
            size: "M",
            priceInPaisa: 200000,
            stock: 1,
          },
        },
      },
      include: { variants: true },
    });
    productId = product.id;
    variantId = product.variants[0].id;

    const address = await json(base, "/users/me/addresses", {
      method: "POST",
      token: customerTokens.accessToken,
      body: {
        label: "Home",
        name: "Test Customer",
        line1: "1 Test Road",
        city: "Lahore",
        region: "Punjab",
        postalCode: "54000",
        phone: "03001234567",
      },
    });
    assert.equal(address.status, 201);
    const addressId = (address.body as { id: string }).id;

    const cart = await json(base, "/cart", {
      method: "POST",
      token: customerTokens.accessToken,
      body: { variantId, quantity: 1 },
    });
    assert.equal(cart.status, 201);

    const badPromo = await place(base, customerTokens.accessToken, addressId, `${run}-promo`, "NOPE");
    assert.equal(badPromo.status, 400);
    assert.equal((await stock(prisma, variantId)).stock, 1);

    await prisma.productVariant.update({ where: { id: variantId }, data: { stock: 0, soldOut: false } });
    const short = await place(base, customerTokens.accessToken, addressId, `${run}-short`);
    assert.equal(short.status, 400);
    assert.equal((await stock(prisma, variantId)).stock, 0);

    await prisma.productVariant.update({ where: { id: variantId }, data: { stock: 1, soldOut: false } });
    const created = await place(base, customerTokens.accessToken, addressId, `${run}-ok`, "ABEERA10");
    assert.equal(created.status, 201);
    const order = created.body as { id: string; total: number; discount: number; shipping: number };
    assert.equal(order.discount, 20000);
    assert.equal(order.shipping, 30000);
    assert.equal(order.total, 210000);
    const afterCreate = await stock(prisma, variantId);
    assert.equal(afterCreate.stock, 0);
    assert.equal(afterCreate.soldOut, true);

    const replay = await place(base, customerTokens.accessToken, addressId, `${run}-ok`, "ABEERA10");
    assert.equal(replay.status, 201);
    assert.equal((replay.body as { id: string }).id, order.id);
    assert.equal((await stock(prisma, variantId)).stock, 0);

    const foreignPay = await json(base, `/payments/jazzcash/init/${order.id}`, {
      method: "POST",
      token: adminTokens.accessToken,
    });
    assert.equal(foreignPay.status, 403);
    const ownPay = await json(base, `/payments/jazzcash/init/${order.id}`, {
      method: "POST",
      token: customerTokens.accessToken,
    });
    assert.equal(ownPay.status, 400);
    assert.equal(JSON.stringify(ownPay.body).includes("pp_Password"), false);

    const cancelled = await json(base, `/admin/orders/${order.id}/status`, {
      method: "PATCH",
      token: adminTokens.accessToken,
      body: { status: "CANCELLED" },
    });
    assert.equal(cancelled.status, 200);
    const restored = await stock(prisma, variantId);
    assert.equal(restored.stock, 1);
    assert.equal(restored.soldOut, false);

    console.log("commerce tests passed");
  } finally {
    if (variantId) {
      await prisma.orderItem.deleteMany({ where: { variantId } });
      await prisma.cartItem.deleteMany({ where: { variantId } });
      await prisma.productVariant.deleteMany({ where: { id: variantId } });
    }
    if (productId) {
      await prisma.payment.deleteMany({ where: { order: { user: { email: { in: [customerEmail, adminEmail] } } } } });
      await prisma.order.deleteMany({ where: { user: { email: { in: [customerEmail, adminEmail] } } } });
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.address.deleteMany({ where: { user: { email: { in: [customerEmail, adminEmail] } } } });
    await prisma.user.deleteMany({ where: { email: { in: [customerEmail, adminEmail] } } });
    await app?.close();
    await prisma.$disconnect();
  }
}

type Tokens = { accessToken: string; refreshToken: string; user: { role: string } };

async function place(
  base: string,
  token: string,
  addressId: string,
  idempotencyKey: string,
  promoCode?: string,
) {
  return json(base, "/orders", {
    method: "POST",
    token,
    body: {
      addressId,
      paymentMethod: "COD",
      shippingMethod: "standard",
      promoCode,
      idempotencyKey,
    },
  });
}

async function stock(prisma: PrismaClient, variantId: string) {
  const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
  return variant;
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
