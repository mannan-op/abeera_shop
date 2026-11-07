import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import {
  enabledPaymentMethods,
  quoteTotals,
  shippingRates,
  type GuestOrderInput,
  type OrderLookupInput,
} from "@abeera/shared";

import { PrismaService } from "../../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { SiteDocumentsService } from "../site/site-documents.service";

const orderInclude = { items: true, payment: true, address: true } as const;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private site: SiteDocumentsService,
    private mail: MailService,
  ) {}

  /** Guest checkout: no account; prices and stock come from the database, never the client. */
  async create(input: GuestOrderInput) {
    const email = input.customer.email;
    const replay = await this.prisma.order.findFirst({
      where: { customerEmail: email, idempotencyKey: input.idempotencyKey },
      include: orderInclude,
    });
    if (replay) return replay;

    // Only methods switched on in Site settings are accepted. JazzCash and
    // Easypaisa stay in the enum and payments module but are not offered.
    const settings = await this.site.settings();
    const allowed: string[] = enabledPaymentMethods(settings);
    if (!allowed.includes(input.paymentMethod)) {
      throw new BadRequestException(
        allowed.length
          ? "That payment method isn't available. Please choose Cash on delivery."
          : "Checkout is paused: no payment method is switched on.",
      );
    }

    // Merge duplicate lines, then load the real variants.
    const quantities = new Map<string, number>();
    for (const line of input.items) quantities.set(line.variantId, (quantities.get(line.variantId) ?? 0) + line.quantity);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: [...quantities.keys()] } },
      include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
    });
    if (variants.length !== quantities.size) {
      throw new BadRequestException("Something in your bag is no longer available. Please remove it and try again.");
    }
    const lines = variants.map((variant) => ({ variant, quantity: quantities.get(variant.id)! }));

    const subtotal = lines.reduce((sum, line) => sum + line.variant.priceInPaisa * line.quantity, 0);
    const quote = quoteTotals({
      subtotal,
      shippingMethod: input.shippingMethod,
      promoCode: input.promoCode,
      rates: shippingRates(settings),
    });
    if (!quote.ok) throw new BadRequestException(quote.error);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const order = await this.prisma.$transaction(async (tx) => {
          const existing = await tx.order.findFirst({
            where: { customerEmail: email, idempotencyKey: input.idempotencyKey },
            include: orderInclude,
          });
          if (existing) return { order: existing, created: false };

          for (const line of lines) {
            await this.takeStock(tx, line.variant.id, line.quantity);
          }

          const address = await tx.address.create({
            data: {
              label: "Checkout",
              name: input.customer.name,
              phone: input.customer.phone,
              line1: input.address.line1,
              line2: input.address.line2 || null,
              city: input.address.city,
              region: input.address.region,
              postalCode: input.address.postalCode,
              country: "Pakistan",
            },
          });

          const created = await tx.order.create({
            data: {
              orderNumber: newOrderNumber(),
              customerName: input.customer.name,
              customerEmail: email,
              customerPhone: input.customer.phone,
              addressId: address.id,
              idempotencyKey: input.idempotencyKey,
              subtotal,
              shipping: quote.shipping,
              shippingMethod: quote.shippingMethod,
              discount: quote.discount,
              tax: quote.tax,
              total: quote.total,
              items: {
                create: lines.map(({ variant, quantity }) => ({
                  variantId: variant.id,
                  productName: variant.product.name,
                  productSlug: variant.product.slug,
                  productImage: variant.product.images[0]?.url ?? null,
                  color: variant.color,
                  size: variant.size,
                  price: variant.priceInPaisa,
                  quantity,
                })),
              },
              payment: {
                create: {
                  method: input.paymentMethod,
                  amount: quote.total,
                  status: "PENDING",
                },
              },
            },
            include: orderInclude,
          });
          return { order: created, created: true };
        });
        // Queued after commit; a Redis or mail failure never fails the order.
        if (order.created) this.mail.orderPlaced(order.order.id);
        return order.order;
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
        if (isUniqueOn(error, "idempotencyKey")) {
          const existing = await this.prisma.order.findFirst({
            where: { customerEmail: email, idempotencyKey: input.idempotencyKey },
            include: orderInclude,
          });
          if (existing) return existing;
        }
        if (isUniqueOn(error, "orderNumber")) continue;
        throw error;
      }
    }

    throw new BadRequestException("Could not allocate an order number");
  }

  /** Public order lookup: the order number and the email on the order must both match. */
  async lookup(input: OrderLookupInput) {
    const order = await this.prisma.order.findFirst({
      where: { orderNumber: input.orderNumber, customerEmail: { equals: input.email, mode: "insensitive" } },
      include: { items: true, payment: true, address: { select: { city: true, region: true } } },
    });
    if (!order) throw new NotFoundException("We couldn't find an order with that number and email.");
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      shippingMethod: order.shippingMethod,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.payment?.method ?? null,
      customerName: order.customerName,
      city: order.address.city,
      items: order.items.map((i) => ({
        productName: i.productName,
        productSlug: i.productSlug,
        productImage: i.productImage,
        color: i.color,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
      })),
    };
  }

  async findByUser(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string, userId?: string) {
    const where: Prisma.OrderWhereInput = { id };
    if (userId) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: orderInclude,
    });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async updateStatus(
    id: string,
    status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) throw new NotFoundException("Order not found");
      if (order.status === status) {
        return tx.order.findUniqueOrThrow({ where: { id }, include: orderInclude });
      }
      if (order.status === "CANCELLED") {
        throw new BadRequestException("Cancelled orders cannot change status");
      }
      if (status === "CANCELLED") {
        for (const item of order.items) {
          await this.restoreStock(tx, item.variantId, item.quantity);
        }
      }
      return tx.order.update({
        where: { id },
        data: { status },
        include: orderInclude,
      });
    });
  }

  async findAll(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count(),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  private async takeStock(tx: Prisma.TransactionClient, variantId: string, quantity: number) {
    const updated = await tx.$executeRaw`
      UPDATE product_variants
      SET stock = stock - ${quantity},
          "soldOut" = (stock - ${quantity}) <= 0
      WHERE id = ${variantId}
        AND stock >= ${quantity}
        AND "soldOut" = false
    `;
    if (Number(updated) !== 1) {
      throw new BadRequestException("Not enough stock");
    }
  }

  private async restoreStock(tx: Prisma.TransactionClient, variantId: string, quantity: number) {
    await tx.$executeRaw`
      UPDATE product_variants
      SET stock = stock + ${quantity},
          "soldOut" = false
      WHERE id = ${variantId}
    `;
  }
}

function newOrderNumber() {
  return `AB-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function isUniqueOn(error: unknown, field: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }
  const target = error.meta?.target;
  const text = Array.isArray(target) ? target.join(",") : String(target ?? "");
  return text.toLowerCase().includes(field.toLowerCase());
}
