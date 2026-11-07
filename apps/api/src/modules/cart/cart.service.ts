import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { effectiveUnitPrice } from "@abeera/shared";

import { PrismaService } from "../../prisma/prisma.service";
import { SalesService } from "../sales/sales.service";

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private sales: SalesService,
  ) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: {
              include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
            },
          },
        },
      },
    });
    const now = new Date();
    const campaigns = await this.sales.liveCampaigns(now);

    return items.map((item) => ({
      id: item.id,
      variantId: item.variantId,
      productId: item.variant.productId,
      productName: item.variant.product.name,
      productSlug: item.variant.product.slug,
      productImage: item.variant.product.images[0]?.url ?? null,
      color: item.variant.color,
      size: item.variant.size,
      price: effectiveUnitPrice({
        priceInPaisa: item.variant.priceInPaisa,
        compareAtPrice: item.variant.compareAtPrice,
        productId: item.variant.productId,
        categoryId: item.variant.product.categoryId,
        campaigns,
        now,
      }).price,
      quantity: item.quantity,
      stock: item.variant.stock,
    }));
  }

  async addItem(userId: string, variantId: string, quantity: number) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException("Variant not found");
    if (variant.soldOut || variant.stock < quantity) {
      throw new BadRequestException("Not enough stock");
    }

    await this.prisma.cartItem.upsert({
      where: { userId_variantId: { userId, variantId } },
      update: { quantity: { increment: quantity } },
      create: { userId, variantId, quantity },
    });

    return this.getCart(userId);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) return this.removeItem(userId, itemId);

    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!item) throw new NotFoundException("Cart item not found");

    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    await this.prisma.cartItem.deleteMany({ where: { id: itemId, userId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return [];
  }
}
