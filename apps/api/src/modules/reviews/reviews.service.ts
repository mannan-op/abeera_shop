import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ReviewStatus } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";

const STATUSES = Object.values(ReviewStatus);

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /** Published reviews for the product page. */
  async published(slug: string) {
    const product = await this.prisma.product.findFirst({ where: { slug, deletedAt: null }, select: { id: true } });
    if (!product) throw new NotFoundException("Product not found");
    return this.prisma.review.findMany({
      where: { productId: product.id, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, rating: true, title: true, body: true, createdAt: true, user: { select: { name: true } } },
    });
  }

  /** A signed-in customer's review. Writing again replaces it and sends it back for approval. */
  async submit(userId: string, slug: string, body: { rating?: number; title?: string; body?: string }) {
    const rating = Number(body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BadRequestException("Rating must be 1 to 5 stars.");
    const title = String(body?.title ?? "").trim().slice(0, 120);
    const text = String(body?.body ?? "").trim();
    if (text.length < 10) throw new BadRequestException("Please write at least a sentence.");
    if (text.length > 2000) throw new BadRequestException("Keep the review under 2000 characters.");
    const product = await this.prisma.product.findFirst({ where: { slug, deletedAt: null }, select: { id: true } });
    if (!product) throw new NotFoundException("Product not found");
    const data = { rating, title, body: text, status: ReviewStatus.PENDING };
    return this.prisma.review.upsert({
      where: { productId_userId: { productId: product.id, userId } },
      create: { ...data, productId: product.id, userId },
      update: data,
      select: { id: true, status: true },
    });
  }

  async adminList(status?: string, search?: string) {
    const where: Prisma.ReviewWhereInput = {};
    if (status && STATUSES.includes(status as ReviewStatus)) where.status = status as ReviewStatus;
    const q = search?.trim();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
        { user: { name: { contains: q, mode: "insensitive" } } },
      ];
    }
    const [items, groups, avg] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        take: 200,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } } } },
        },
      }),
      this.prisma.review.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.review.aggregate({ where: { status: "PUBLISHED" }, _avg: { rating: true } }),
    ]);
    const counts = Object.fromEntries(STATUSES.map((s) => [s, groups.find((g) => g.status === s)?._count._all ?? 0]));
    return { items, counts, averagePublished: avg._avg.rating };
  }

  async setStatus(id: string, status: string) {
    if (!STATUSES.includes(status as ReviewStatus)) throw new BadRequestException("Status must be PENDING, PUBLISHED or HIDDEN.");
    const review = await this.prisma.review
      .update({ where: { id }, data: { status: status as ReviewStatus }, include: { product: { select: { slug: true } } } })
      .catch((error) => this.notFound(error));
    await this.redis.del(`product:${review.product.slug}`);
    return review;
  }

  async remove(id: string) {
    const review = await this.prisma.review
      .delete({ where: { id }, include: { product: { select: { slug: true } } } })
      .catch((error) => this.notFound(error));
    await this.redis.del(`product:${review.product.slug}`);
    return { deleted: true };
  }

  private notFound(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new NotFoundException("Review not found");
    throw error;
  }
}
