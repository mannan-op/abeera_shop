import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { quoteTotals, type CreateOrderInput } from "@abeera/shared";

import { PrismaService } from "../../prisma/prisma.service";

const orderInclude = { items: true, payment: true, address: true } as const;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateOrderInput) {
    const replay = await this.prisma.order.findFirst({
      where: { userId, idempotencyKey: input.idempotencyKey },
      include: orderInclude,
    });
    if (replay) return replay;

    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
          },
        },
      },
    });

    if (cartItems.length === 0) throw new BadRequestException("Cart is empty");
    if (cartItems.some((item) => item.quantity <= 0)) {
      throw new BadRequestException("Invalid cart quantity");
    }

    const address = await this.prisma.address.findFirst({ where: { id: input.addressId, userId } });
    if (!address) throw new NotFoundException("Address not found");

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.variant.priceInPaisa * item.quantity,
      0,
    );
    const quote = quoteTotals({
      subtotal,
      shippingMethod: input.shippingMethod,
      promoCode: input.promoCode,
    });
    if (!quote.ok) throw new BadRequestException(quote.error);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const existing = await tx.order.findFirst({
            where: { userId, idempotencyKey: input.idempotencyKey },
            include: orderInclude,
          });
          if (existing) return existing;

          for (const item of cartItems) {
            await this.takeStock(tx, item.variantId, item.quantity);
          }

          const order = await tx.order.create({
            data: {
              orderNumber: newOrderNumber(),
              userId,
              addressId: input.addressId,
              idempotencyKey: input.idempotencyKey,
              subtotal,
              shipping: quote.shipping,
              shippingMethod: quote.shippingMethod,
              discount: quote.discount,
              tax: quote.tax,
              total: quote.total,
              items: {
                create: cartItems.map((item) => ({
                  variantId: item.variantId,
                  productName: item.variant.product.name,
                  productSlug: item.variant.product.slug,
                  productImage: item.variant.product.images[0]?.url ?? null,
                  color: item.variant.color,
                  size: item.variant.size,
                  price: item.variant.priceInPaisa,
                  quantity: item.quantity,
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

          await tx.cartItem.deleteMany({ where: { userId } });
          return order;
        });
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
        if (isUniqueOn(error, "idempotencyKey")) {
          const existing = await this.prisma.order.findFirst({
            where: { userId, idempotencyKey: input.idempotencyKey },
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
        include: {
          ...orderInclude,
          user: { select: { name: true, email: true } },
        },
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
