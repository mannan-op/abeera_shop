import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";

type ProductFilter = {
  category?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  isNew?: boolean;
  onSale?: boolean;
  isBestSeller?: boolean;
};

const productInclude = {
  category: true,
  variants: true,
  images: { orderBy: { sortOrder: "asc" as const } },
} as const;

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(filters: ProductFilter) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 24;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = { deletedAt: null };

    if (filters.category) {
      where.category = { slug: filters.category };
    }
    if (filters.isNew) where.isNew = true;
    if (filters.isBestSeller) where.isBestSeller = true;

    const variantSome: Prisma.ProductVariantWhereInput = {};
    if (filters.size) {
      variantSome.size = filters.size;
      variantSome.soldOut = false;
    }
    if (filters.minPrice || filters.maxPrice) {
      variantSome.priceInPaisa = {
        ...(filters.minPrice ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
      };
    }
    if (filters.onSale) {
      variantSome.compareAtPrice = { not: null };
    }
    if (Object.keys(variantSome).length > 0) {
      where.variants = { some: variantSome };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { tagline: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (filters.sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "price-asc":
        orderBy = { variants: { _count: "asc" } };
        break;
      case "price-desc":
        orderBy = { variants: { _count: "desc" } };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "featured":
      default:
        orderBy = { isBestSeller: "desc" };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(this.toListItem),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async findBySlug(slug: string) {
    const cacheKey = `product:${slug}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: {
        ...productInclude,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) throw new NotFoundException("Product not found");

    await this.redis.setJson(cacheKey, product, 600);
    return product;
  }

  async create(data: {
    name: string; slug: string; tagline?: string; description?: string;
    details?: string; materials?: string; care?: string; categoryId: string;
    isNew?: boolean; isBestSeller?: boolean;
    variants: { color: string; colorHex: string; size: string; priceInPaisa: number; compareAtPrice?: number; stock?: number }[];
  }) {
    const { variants, ...productData } = data;
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        variants: { create: variants },
      },
      include: productInclude,
    });
    return product;
  }

  async update(id: string, data: Partial<{
    name: string; slug: string; tagline: string; description: string;
    details: string; materials: string; care: string; categoryId: string;
    isNew: boolean; isBestSeller: boolean;
  }>) {
    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    });
    await this.redis.del(`product:${product.slug}`);
    return product;
  }

  async remove(id: string) {
    const product = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.redis.del(`product:${product.slug}`);
  }

  async getFilterOptions(categorySlug?: string) {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (categorySlug) where.category = { slug: categorySlug };

    const variants = await this.prisma.productVariant.findMany({
      where: { product: where },
      select: { size: true, priceInPaisa: true },
    });

    const sizes = [...new Set(variants.map((v) => v.size))];
    const prices = variants.map((v) => v.priceInPaisa);
    const min = prices.length > 0 ? Math.min(...prices) : 0;
    const max = prices.length > 0 ? Math.max(...prices) : 0;

    return { sizes, min, max };
  }

  private toListItem(product: any) {
    const prices = product.variants.map((v: any) => v.priceInPaisa);
    const comparePrices = product.variants.map((v: any) => v.compareAtPrice).filter(Boolean);
    const allSoldOut = product.variants.every((v: any) => v.soldOut);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      category: product.category,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      rating: product.rating,
      reviewCount: product.reviewCount,
      startingPrice: prices.length > 0 ? Math.min(...prices) : 0,
      compareAtPrice: comparePrices.length > 0 ? Math.min(...comparePrices) : null,
      primaryImage: product.images[0]?.url ?? null,
      soldOut: allSoldOut,
    };
  }
}
