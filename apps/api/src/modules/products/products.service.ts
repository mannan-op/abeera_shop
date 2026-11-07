import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { effectiveUnitPrice, type CampaignRule } from "@abeera/shared";

import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
import { SalesService } from "../sales/sales.service";

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

/** Variants an order still references are kept, renamed with this mark, and hidden. */
const RETIRED_MARK = "(retired ";

const productInclude = {
  category: true,
  variants: {
    where: { NOT: { size: { contains: RETIRED_MARK } } },
    orderBy: [{ color: "asc" }, { priceInPaisa: "asc" }],
  },
  images: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

type VariantInput = {
  id?: string;
  color: string;
  colorHex: string;
  size: string;
  priceInPaisa: number;
  compareAtPrice: number | null;
  stock: number;
  soldOut: boolean;
};

type ImageInput = { url: string; alt: string; sortOrder: number };

export type ProductInput = {
  name: string; slug: string; tagline?: string; description?: string;
  details?: string; materials?: string; care?: string; categoryId: string;
  isNew?: boolean; isBestSeller?: boolean;
  variants?: Partial<VariantInput>[];
  images?: Partial<ImageInput>[];
};

const TEXT_FIELDS = ["name", "slug", "tagline", "description", "details", "materials", "care", "categoryId"] as const;

function withoutId<T extends { id?: string }>(row: T): Omit<T, "id"> {
  const copy = { ...row };
  delete copy.id;
  return copy;
}

function friendly(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") bad("That slug is already used by another product (including deleted ones).");
    if (error.code === "P2003") bad("That category doesn't exist.");
  }
  throw error;
}

function bad(message: string): never {
  throw new BadRequestException(message);
}

/** Validates and cleans a product payload from the admin. */
function normalizeProductInput(data: Partial<ProductInput>, creating: boolean) {
  if (!data || typeof data !== "object") bad("Product data is missing.");
  const out: Record<string, unknown> = {};
  for (const key of TEXT_FIELDS) {
    if (data[key] === undefined) continue;
    if (typeof data[key] !== "string") bad(`${key} must be text.`);
    out[key] = (data[key] as string).trim();
  }
  for (const key of ["isNew", "isBestSeller"] as const) {
    if (data[key] !== undefined) out[key] = Boolean(data[key]);
  }
  if (creating && (!out.name || !out.slug || !out.categoryId)) bad("Name, slug and category are required.");
  if (out.name === "") bad("Name is required.");
  if (out.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.slug as string)) {
    bad("Slug may only use lowercase letters, numbers and dashes.");
  }

  let variants: VariantInput[] | undefined;
  if (data.variants !== undefined || creating) {
    if (!Array.isArray(data.variants) || data.variants.length === 0) bad("Add at least one size.");
    const seen = new Set<string>();
    variants = data.variants.map((v, i) => {
      const row = `Row ${i + 1}`;
      const color = String(v?.color ?? "").trim();
      const size = String(v?.size ?? "").trim();
      if (!color) bad(`${row}: colour is required.`);
      if (!size) bad(`${row}: size is required.`);
      const key = `${color.toLowerCase()}|${size.toLowerCase()}`;
      if (seen.has(key)) bad(`${color} / ${size} appears twice.`);
      seen.add(key);
      const price = Number(v?.priceInPaisa);
      if (!Number.isInteger(price) || price <= 0) bad(`${row}: price must be more than 0.`);
      const compare = v?.compareAtPrice == null ? null : Number(v.compareAtPrice);
      if (compare !== null && (!Number.isInteger(compare) || compare <= price)) {
        bad(`${row}: the original price must be higher than the selling price.`);
      }
      const stock = Number(v?.stock ?? 0);
      if (!Number.isInteger(stock) || stock < 0) bad(`${row}: stock can't be negative.`);
      const hex = String(v?.colorHex ?? "#888888").trim();
      if (!/^#[0-9a-fA-F]{6}$/.test(hex)) bad(`${row}: colour swatch must look like #a1b2c3.`);
      return {
        id: typeof v?.id === "string" && v.id ? v.id : undefined,
        color, size, colorHex: hex, priceInPaisa: price, compareAtPrice: compare, stock,
        soldOut: Boolean(v?.soldOut),
      };
    });
  }

  let images: ImageInput[] | undefined;
  if (data.images !== undefined) {
    if (!Array.isArray(data.images)) bad("Photos must be a list.");
    if (data.images.length > 12) bad("Use 12 photos or fewer.");
    images = data.images.map((img, i) => {
      const url = String(img?.url ?? "").trim();
      if (!/^https?:\/\/\S+$/i.test(url) && !/^\/[^/]/.test(url)) bad(`Photo ${i + 1}: use a link starting with https:// or /.`);
      return { url, alt: String(img?.alt ?? "").trim().slice(0, 180), sortOrder: i };
    });
  }

  return { ...out, variants, images };
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private sales: SalesService,
  ) {}

  async findAll(filters: ProductFilter) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 24;
    const now = new Date();
    const campaigns = await this.sales.liveCampaigns(now);
    const priceSort = filters.sort === "price-asc" || filters.sort === "price-desc";
    const memoryPrice = campaigns.length > 0 && (filters.minPrice != null || filters.maxPrice != null);
    const where = this.buildWhere(filters, campaigns, { ignorePrice: memoryPrice });

    if (priceSort || memoryPrice) {
      return this.findAllPriced(where, filters, campaigns, now);
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { isBestSeller: "desc" };
    switch (filters.sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "featured":
      case undefined:
      default:
        orderBy = { isBestSeller: "desc" };
        break;
    }

    const skip = (page - 1) * pageSize;
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
      items: items.map((product) => this.toListItem(product, campaigns, now)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, shop = false) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
    if (!product) throw new NotFoundException("Product not found");
    if (!shop) return product;
    const now = new Date();
    return this.sales.presentProduct(product, await this.sales.liveCampaigns(now), now);
  }

  async findBySlug(slug: string) {
    const cacheKey = `product:${slug}`;
    const cached = await this.redis.getJson<Parameters<ProductsService["withCampaignPrices"]>[0]>(cacheKey);
    if (cached) return this.withCampaignPrices(cached);

    const product = await this.prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: {
        ...productInclude,
        reviews: {
          where: { status: "PUBLISHED" },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) throw new NotFoundException("Product not found");

    await this.redis.setJson(cacheKey, product, 600);
    return this.withCampaignPrices(product);
  }

  async create(data: ProductInput) {
    const input = normalizeProductInput(data, true);
    const { variants, images, ...productData } = input;
    const product = await this.prisma.product.create({
      data: {
        ...(productData as Prisma.ProductUncheckedCreateInput),
        variants: { create: variants!.map((v) => withoutId(v)) },
        images: { create: images ?? [] },
      },
      include: productInclude,
    }).catch(friendly);
    return product;
  }

  /**
   * Updates product fields. When `variants` is sent, the list replaces the
   * product's variants: matched by id (or colour + size), new rows created,
   * missing rows deleted — or, if an order already references them, kept but
   * marked sold out with no stock so order history stays intact.
   * When `images` is sent, it replaces the product's photos in that order.
   */
  async update(id: string, data: Partial<ProductInput>) {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        variants: {
          where: { NOT: { size: { contains: RETIRED_MARK } } },
          include: { _count: { select: { orderItems: true } } },
        },
      },
    });
    if (!existing) throw new NotFoundException("Product not found");

    const input = normalizeProductInput(data, false);
    const { variants, images, ...productData } = input;

    const product = await this.prisma.$transaction(async (tx) => {
      if (variants) {
        const keyOf = (v: { color: string; size: string }) => `${v.color.toLowerCase()}|${v.size.toLowerCase()}`;
        const byId = new Map(existing.variants.map((v) => [v.id, v]));
        const byKey = new Map(existing.variants.map((v) => [keyOf(v), v]));
        const matched = new Set<string>();
        const plan = variants.map((v) => {
          const hit = (v.id && byId.get(v.id)) || byKey.get(keyOf(v));
          if (hit && !matched.has(hit.id)) {
            matched.add(hit.id);
            return { ...v, id: hit.id };
          }
          return { ...v, id: undefined };
        });
        const removed = existing.variants.filter((v) => !matched.has(v.id));
        for (const v of removed) {
          await tx.cartItem.deleteMany({ where: { variantId: v.id } });
          if (v._count.orderItems > 0) {
            // Park under a unique retired name so the colour/size can be reused.
            await tx.productVariant.update({
              where: { id: v.id },
              data: { soldOut: true, stock: 0, size: `${v.size} ${RETIRED_MARK}${v.id.slice(0, 6)})` },
            });
          } else {
            await tx.productVariant.delete({ where: { id: v.id } });
          }
        }
        // Two passes avoid unique (colour, size) clashes when rows swap.
        const kept = plan.filter((v) => v.id);
        for (const v of kept) {
          await tx.productVariant.update({ where: { id: v.id }, data: { size: `__tmp_${v.id}` } });
        }
        for (const { id: variantId, ...v } of kept) {
          await tx.productVariant.update({ where: { id: variantId }, data: v });
        }
        for (const v of plan.filter((p) => !p.id)) {
          await tx.productVariant.create({ data: { ...withoutId(v), productId: id } });
        }
      }
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length) {
          await tx.productImage.createMany({ data: images.map((img) => ({ ...img, productId: id })) });
        }
      }
      return tx.product.update({
        where: { id },
        data: productData as Prisma.ProductUncheckedUpdateInput,
        include: productInclude,
      });
    }).catch(friendly);

    await this.redis.del(`product:${existing.slug}`);
    if (product.slug !== existing.slug) await this.redis.del(`product:${product.slug}`);
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
    const now = new Date();
    const campaigns = await this.sales.liveCampaigns(now);

    const variants = await this.prisma.productVariant.findMany({
      where: { product: where, NOT: { size: { contains: RETIRED_MARK } } },
      select: {
        size: true,
        priceInPaisa: true,
        compareAtPrice: true,
        productId: true,
        product: { select: { categoryId: true } },
      },
    });

    const sizes = [...new Set(variants.map((v) => v.size))];
    const prices = variants.map(
      (variant) =>
        effectiveUnitPrice({
          priceInPaisa: variant.priceInPaisa,
          compareAtPrice: variant.compareAtPrice,
          productId: variant.productId,
          categoryId: variant.product.categoryId,
          campaigns,
          now,
        }).price,
    );
    const min = prices.length > 0 ? Math.min(...prices) : 0;
    const max = prices.length > 0 ? Math.max(...prices) : 0;

    return { sizes, min, max };
  }

  private buildWhere(
    filters: ProductFilter,
    campaigns: CampaignRule[],
    opts: { ignorePrice: boolean },
  ): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    const and: Prisma.ProductWhereInput[] = [];

    if (filters.category) where.category = { slug: filters.category };
    if (filters.isNew) where.isNew = true;
    if (filters.isBestSeller) where.isBestSeller = true;

    const variantSome: Prisma.ProductVariantWhereInput = {};
    if (filters.size) {
      variantSome.size = filters.size;
      variantSome.soldOut = false;
    }
    if (!opts.ignorePrice && (filters.minPrice || filters.maxPrice)) {
      variantSome.priceInPaisa = {
        ...(filters.minPrice ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
      };
    }
    if (Object.keys(variantSome).length > 0) and.push({ variants: { some: variantSome } });

    if (filters.onSale && !campaigns.some((campaign) => campaign.scope === "ALL")) {
      const categoryIds = [...new Set(campaigns.filter((c) => c.scope === "CATEGORIES").flatMap((c) => c.categoryIds))];
      const productIds = [...new Set(campaigns.filter((c) => c.scope === "PRODUCTS").flatMap((c) => c.productIds))];
      const saleOr: Prisma.ProductWhereInput[] = [{ variants: { some: { compareAtPrice: { not: null } } } }];
      if (categoryIds.length) saleOr.push({ categoryId: { in: categoryIds } });
      if (productIds.length) saleOr.push({ id: { in: productIds } });
      and.push({ OR: saleOr });
    }

    if (filters.search) {
      and.push({
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { tagline: { contains: filters.search, mode: "insensitive" } },
        ],
      });
    }

    if (and.length) where.AND = and;
    return where;
  }

  /** Price sort, and price filters while a campaign is live, use the effective price. */
  private async findAllPriced(
    where: Prisma.ProductWhereInput,
    filters: ProductFilter,
    campaigns: CampaignRule[],
    now: Date,
  ) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 24;
    const candidates = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        categoryId: true,
        variants: { select: { priceInPaisa: true, compareAtPrice: true } },
      },
    });
    let ranked = candidates.map((product) => ({
      id: product.id,
      price: lowestPrice(product, campaigns, now),
    }));
    if (filters.minPrice != null) ranked = ranked.filter((row) => row.price >= filters.minPrice!);
    if (filters.maxPrice != null) ranked = ranked.filter((row) => row.price <= filters.maxPrice!);
    const direction = filters.sort === "price-desc" ? -1 : 1;
    if (filters.sort === "price-asc" || filters.sort === "price-desc") {
      ranked.sort((a, b) => (a.price - b.price) * direction);
    }
    const pageIds = ranked.slice((page - 1) * pageSize, page * pageSize).map((row) => row.id);
    const rows = pageIds.length
      ? await this.prisma.product.findMany({ where: { id: { in: pageIds } }, include: productInclude })
      : [];
    const byId = new Map(rows.map((row) => [row.id, row]));
    return {
      items: pageIds.flatMap((id) => {
        const row = byId.get(id);
        return row ? [this.toListItem(row, campaigns, now)] : [];
      }),
      total: ranked.length,
      page,
      pageSize,
      totalPages: Math.ceil(ranked.length / pageSize),
    };
  }

  private async withCampaignPrices<T extends { id: string; categoryId: string; variants: { priceInPaisa: number; compareAtPrice: number | null }[] }>(
    product: T,
  ) {
    const now = new Date();
    return this.sales.presentProduct(product, await this.sales.liveCampaigns(now), now);
  }

  private toListItem(
    product: Prisma.ProductGetPayload<{ include: typeof productInclude }>,
    campaigns: CampaignRule[],
    now: Date,
  ) {
    const priced = product.variants.map((variant) =>
      effectiveUnitPrice({
        priceInPaisa: variant.priceInPaisa,
        compareAtPrice: variant.compareAtPrice,
        productId: product.id,
        categoryId: product.categoryId,
        campaigns,
        now,
      }),
    );
    const cheapest = priced.reduce<(typeof priced)[number] | undefined>(
      (best, row) => (!best || row.price < best.price ? row : best),
      undefined,
    );
    const allSoldOut = product.variants.every((v) => v.soldOut);

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
      startingPrice: cheapest?.price ?? 0,
      compareAtPrice: cheapest?.compareAt ?? null,
      primaryImage: product.images[0]?.url ?? null,
      soldOut: allSoldOut,
    };
  }
}

function lowestPrice(
  product: { id: string; categoryId: string; variants: { priceInPaisa: number; compareAtPrice: number | null }[] },
  campaigns: CampaignRule[],
  now: Date,
) {
  if (product.variants.length === 0) return Number.MAX_SAFE_INTEGER;
  return Math.min(
    ...product.variants.map(
      (variant) =>
        effectiveUnitPrice({
          priceInPaisa: variant.priceInPaisa,
          compareAtPrice: variant.compareAtPrice,
          productId: product.id,
          categoryId: product.categoryId,
          campaigns,
          now,
        }).price,
    ),
  );
}
