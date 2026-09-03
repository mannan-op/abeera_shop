import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, addressId: string, paymentMethod: "JAZZCASH" | "EASYPAISA" | "COD") {
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

    const address = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException("Address not found");

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.variant.priceInPaisa * item.quantity,
      0,
    );
    const shipping = subtotal >= 500000 ? 0 : 30000;
    const tax = 0;
    const total = subtotal + shipping + tax;

    const orderNumber = `AB-${Date.now().toString(36).toUpperCase()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          subtotal,
          shipping,
          tax,
          total,
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
              method: paymentMethod,
              amount: total,
              status: paymentMethod === "COD" ? "PENDING" : "PENDING",
            },
          },
        },
        include: { items: true, payment: true, address: true },
      });

      for (const item of cartItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    return order;
  }

  async findByUser(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true, address: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: { items: true, payment: true, address: true },
    });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async updateStatus(id: string, status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED") {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async findAll(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        include: { items: true, payment: true, address: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count(),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
