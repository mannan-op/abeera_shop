import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  campaignBanner,
  campaignIsLive,
  campaignWindow,
  type CampaignRule,
  type CampaignScope,
  type DiscountKind,
  effectiveUnitPrice,
  type PromoRule,
} from "@abeera/shared";

import { PrismaService } from "../../prisma/prisma.service";

const campaignInclude = {
  categories: { select: { categoryId: true } },
  products: { select: { productId: true } },
} satisfies Prisma.SaleCampaignInclude;

type CampaignRow = Prisma.SaleCampaignGetPayload<{ include: typeof campaignInclude }>;

export type CampaignInput = {
  name?: string;
  discountType?: string;
  amount?: number;
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
  scope?: string;
  categoryIds?: string[];
  productIds?: string[];
  bannerText?: string;
};

export type PromoInput = {
  code?: string;
  discountType?: string;
  amount?: number;
  minSubtotal?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  active?: boolean;
};

type PricedProduct = {
  id: string;
  categoryId: string;
  variants: { priceInPaisa: number; compareAtPrice: number | null }[];
};

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async liveCampaigns(now = new Date()): Promise<CampaignRule[]> {
    const rows = await this.prisma.saleCampaign.findMany({
      where: { active: true, startsAt: { lte: now }, endsAt: { gt: now } },
      include: campaignInclude,
    });
    return rows.map(toCampaignRule).filter((rule) => campaignIsLive(rule, now));
  }

  async banner(now = new Date()) {
    const text = campaignBanner(await this.liveCampaigns(now), now);
    return { text };
  }

  presentProduct<T extends PricedProduct>(product: T, campaigns: CampaignRule[], now: Date): T {
    return {
      ...product,
      variants: product.variants.map((variant) => {
        const priced = effectiveUnitPrice({
          priceInPaisa: variant.priceInPaisa,
          compareAtPrice: variant.compareAtPrice,
          productId: product.id,
          categoryId: product.categoryId,
          campaigns,
          now,
        });
        return { ...variant, priceInPaisa: priced.price, compareAtPrice: priced.compareAt };
      }),
    };
  }

  async listCampaigns() {
    const rows = await this.prisma.saleCampaign.findMany({
      include: campaignInclude,
      orderBy: { startsAt: "desc" },
    });
    return rows.map((row) => toCampaignDto(row));
  }

  async getCampaign(id: string) {
    const row = await this.prisma.saleCampaign.findUnique({ where: { id }, include: campaignInclude });
    if (!row) throw new NotFoundException("Sale not found");
    return toCampaignDto(row);
  }

  async createCampaign(input: CampaignInput) {
    const data = await this.normalizeCampaign(input, true);
    const row = await this.prisma.saleCampaign.create({
      data: {
        name: data.name,
        discountType: data.discountType,
        amount: data.amount,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        active: data.active,
        scope: data.scope,
        bannerText: data.bannerText,
        categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
        products: { create: data.productIds.map((productId) => ({ productId })) },
      },
      include: campaignInclude,
    });
    return toCampaignDto(row);
  }

  async updateCampaign(id: string, input: CampaignInput) {
    const existing = await this.prisma.saleCampaign.findUnique({ where: { id }, include: campaignInclude });
    if (!existing) throw new NotFoundException("Sale not found");
    const data = await this.normalizeCampaign(
      {
        name: input.name ?? existing.name,
        discountType: input.discountType ?? existing.discountType,
        amount: input.amount ?? existing.amount,
        startsAt: input.startsAt ?? existing.startsAt.toISOString(),
        endsAt: input.endsAt ?? existing.endsAt.toISOString(),
        active: input.active ?? existing.active,
        scope: input.scope ?? existing.scope,
        categoryIds: input.categoryIds ?? existing.categories.map((link) => link.categoryId),
        productIds: input.productIds ?? existing.products.map((link) => link.productId),
        bannerText: input.bannerText ?? existing.bannerText,
      },
      true,
    );
    const row = await this.prisma.$transaction(async (tx) => {
      await tx.saleCampaignCategory.deleteMany({ where: { campaignId: id } });
      await tx.saleCampaignProduct.deleteMany({ where: { campaignId: id } });
      if (data.categoryIds.length) {
        await tx.saleCampaignCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({ campaignId: id, categoryId })),
        });
      }
      if (data.productIds.length) {
        await tx.saleCampaignProduct.createMany({
          data: data.productIds.map((productId) => ({ campaignId: id, productId })),
        });
      }
      return tx.saleCampaign.update({
        where: { id },
        data: {
          name: data.name,
          discountType: data.discountType,
          amount: data.amount,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          active: data.active,
          scope: data.scope,
          bannerText: data.bannerText,
        },
        include: campaignInclude,
      });
    });
    return toCampaignDto(row);
  }

  /** Closes the date window immediately. Switching the sale back on does not reopen it. */
  async endCampaign(id: string) {
    const existing = await this.prisma.saleCampaign.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Sale not found");
    const endsAt = new Date();
    const row = await this.prisma.saleCampaign.update({
      where: { id },
      data: { endsAt },
      include: campaignInclude,
    });
    return toCampaignDto(row);
  }

  async removeCampaign(id: string) {
    const existing = await this.prisma.saleCampaign.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Sale not found");
    await this.prisma.saleCampaign.delete({ where: { id } });
  }

  async listPromos() {
    const rows = await this.prisma.promoCode.findMany({ orderBy: { code: "asc" } });
    return rows.map(toPromoDto);
  }

  async getPromo(id: string) {
    const row = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Promo code not found");
    return toPromoDto(row);
  }

  async createPromo(input: PromoInput) {
    const data = normalizePromo(input, true);
    const row = await this.prisma.promoCode
      .create({
        data: {
          code: data.code,
          discountType: data.discountType,
          amount: data.amount,
          minSubtotal: data.minSubtotal,
          startsAt: data.startsAt,
          expiresAt: data.expiresAt,
          usageLimit: data.usageLimit,
          active: data.active,
        },
      })
      .catch(promoError);
    return toPromoDto(row);
  }

  async updatePromo(id: string, input: PromoInput) {
    const existing = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Promo code not found");
    const data = normalizePromo(
      {
        code: input.code ?? existing.code,
        discountType: input.discountType ?? existing.discountType,
        amount: input.amount ?? existing.amount,
        minSubtotal: input.minSubtotal ?? existing.minSubtotal,
        startsAt: input.startsAt !== undefined ? input.startsAt : existing.startsAt?.toISOString() ?? null,
        expiresAt: input.expiresAt !== undefined ? input.expiresAt : existing.expiresAt?.toISOString() ?? null,
        usageLimit: input.usageLimit !== undefined ? input.usageLimit : existing.usageLimit,
        active: input.active ?? existing.active,
      },
      true,
    );
    const row = await this.prisma.promoCode
      .update({
        where: { id },
        data: {
          code: data.code,
          discountType: data.discountType,
          amount: data.amount,
          minSubtotal: data.minSubtotal,
          startsAt: data.startsAt,
          expiresAt: data.expiresAt,
          usageLimit: data.usageLimit,
          active: data.active,
        },
      })
      .catch(promoError);
    return toPromoDto(row);
  }

  async removePromo(id: string) {
    const existing = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Promo code not found");
    await this.prisma.promoCode.delete({ where: { id } });
  }

  private async normalizeCampaign(input: CampaignInput, creating: boolean) {
    if (!input || typeof input !== "object") bad("Sale data is missing.");
    const name = input.name !== undefined ? String(input.name).trim() : "";
    if ((creating || input.name !== undefined) && (!name || name.length > 80)) {
      bad("Name is required (80 characters max).");
    }
    const discountType = parseDiscount(input.discountType, creating || input.discountType !== undefined);
    const amount = parseAmount(input.amount, discountType, creating || input.amount !== undefined);
    const startsAt = parseDate(input.startsAt, "Start", creating || input.startsAt !== undefined);
    const endsAt = parseDate(input.endsAt, "End", creating || input.endsAt !== undefined);
    if (startsAt && endsAt && endsAt.getTime() <= startsAt.getTime()) {
      bad("The end must be after the start.");
    }
    const scope = parseScope(input.scope, creating || input.scope !== undefined);
    const categoryIds = uniqueIds(input.categoryIds);
    const productIds = uniqueIds(input.productIds);
    if (scope === "CATEGORIES" && categoryIds.length === 0) bad("Choose at least one category.");
    if (scope === "PRODUCTS" && productIds.length === 0) bad("Choose at least one product.");
    const storedCategories = scope === "CATEGORIES" ? categoryIds : scope === "ALL" || scope === "PRODUCTS" ? [] : categoryIds;
    const storedProducts = scope === "PRODUCTS" ? productIds : scope === "ALL" || scope === "CATEGORIES" ? [] : productIds;
    if (scope === "CATEGORIES") await this.assertCategories(storedCategories);
    if (scope === "PRODUCTS") await this.assertProducts(storedProducts);
    const bannerText = input.bannerText !== undefined ? String(input.bannerText).trim().slice(0, 180) : "";
    return {
      name,
      discountType: (discountType ?? "PERCENT") as DiscountKind,
      amount: amount ?? 0,
      startsAt: startsAt ?? new Date(),
      endsAt: endsAt ?? new Date(),
      active: input.active === undefined ? true : Boolean(input.active),
      scope: (scope ?? "ALL") as CampaignScope,
      categoryIds: scope ? storedCategories : categoryIds,
      productIds: scope ? storedProducts : productIds,
      bannerText,
    };
  }

  private async assertCategories(ids: string[]) {
    if (ids.length === 0) return;
    const found = await this.prisma.category.count({ where: { id: { in: ids } } });
    if (found !== ids.length) bad("Choose categories that exist.");
  }

  private async assertProducts(ids: string[]) {
    if (ids.length === 0) return;
    const found = await this.prisma.product.count({ where: { id: { in: ids }, deletedAt: null } });
    if (found !== ids.length) bad("Choose products that exist.");
  }
}

function toCampaignRule(row: CampaignRow): CampaignRule {
  return {
    id: row.id,
    name: row.name,
    discountType: row.discountType,
    amount: row.amount,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    active: row.active,
    scope: row.scope,
    categoryIds: row.categories.map((link) => link.categoryId),
    productIds: row.products.map((link) => link.productId),
    bannerText: row.bannerText,
  };
}

function toCampaignDto(row: CampaignRow) {
  const rule = toCampaignRule(row);
  return {
    ...rule,
    startsAt: new Date(rule.startsAt).toISOString(),
    endsAt: new Date(rule.endsAt).toISOString(),
    bannerText: rule.bannerText ?? "",
    status: campaignWindow(rule),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toPromoRule(row: {
  code: string;
  discountType: DiscountKind;
  amount: number;
  minSubtotal: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
}): PromoRule {
  return {
    code: row.code,
    discountType: row.discountType,
    amount: row.amount,
    minSubtotal: row.minSubtotal,
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    usageLimit: row.usageLimit,
    usedCount: row.usedCount,
    active: row.active,
  };
}

function toPromoDto(row: {
  id: string;
  code: string;
  discountType: DiscountKind;
  amount: number;
  minSubtotal: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discountType,
    amount: row.amount,
    minSubtotal: row.minSubtotal,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    usageLimit: row.usageLimit,
    usedCount: row.usedCount,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function normalizePromo(input: PromoInput, creating: boolean) {
  if (!input || typeof input !== "object") bad("Promo data is missing.");
  const code = input.code !== undefined ? String(input.code).trim().toUpperCase() : "";
  if ((creating || input.code !== undefined) && !/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(code)) {
    bad("Code must be 2–40 letters, numbers, dashes or underscores.");
  }
  const discountType = parseDiscount(input.discountType, creating || input.discountType !== undefined);
  const amount = parseAmount(input.amount, discountType, creating || input.amount !== undefined);
  const minSubtotal = input.minSubtotal === undefined ? 0 : Number(input.minSubtotal);
  if (input.minSubtotal !== undefined && (!Number.isInteger(minSubtotal) || minSubtotal < 0)) {
    bad("Minimum order must be 0 or more.");
  }
  const startsAt = parseOptionalDate(input.startsAt, "Start");
  const expiresAt = parseOptionalDate(input.expiresAt, "Expiry");
  if (startsAt && expiresAt && expiresAt.getTime() <= startsAt.getTime()) {
    bad("Expiry must be after the start.");
  }
  let usageLimit: number | null = null;
  if (input.usageLimit !== undefined && input.usageLimit !== null) {
    usageLimit = Number(input.usageLimit);
    if (!Number.isInteger(usageLimit) || usageLimit < 1) bad("Usage limit must be at least 1, or left empty.");
  }
  return {
    code,
    discountType: (discountType ?? "PERCENT") as DiscountKind,
    amount: amount ?? 0,
    minSubtotal,
    startsAt,
    expiresAt,
    usageLimit,
    active: input.active === undefined ? true : Boolean(input.active),
  };
}

function parseDiscount(value: string | undefined, required: boolean): DiscountKind | undefined {
  if (value === undefined) {
    if (required) bad("Choose percent off or a fixed amount.");
    return undefined;
  }
  if (value !== "PERCENT" && value !== "FIXED") bad("Discount must be a percent or a fixed amount.");
  return value;
}

function parseAmount(value: number | undefined, type: DiscountKind | undefined, required: boolean) {
  if (value === undefined) {
    if (required) bad("Enter how much is off.");
    return undefined;
  }
  const amount = Number(value);
  if (!Number.isInteger(amount) || amount <= 0) bad("The discount must be more than 0.");
  if (type === "PERCENT" && amount > 100) bad("Percent off can't be more than 100.");
  return amount;
}

function parseDate(value: string | undefined, label: string, required: boolean) {
  if (value === undefined || value === "") {
    if (required) bad(`${label} date is required.`);
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) bad(`${label} date isn't valid.`);
  return date;
}

function parseOptionalDate(value: string | null | undefined, label: string) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) bad(`${label} date isn't valid.`);
  return date;
}

function parseScope(value: string | undefined, required: boolean): CampaignScope | undefined {
  if (value === undefined) {
    if (required) bad("Choose what the sale applies to.");
    return undefined;
  }
  if (value !== "ALL" && value !== "CATEGORIES" && value !== "PRODUCTS") {
    bad("Scope must be all products, categories, or products.");
  }
  return value;
}

function uniqueIds(values: string[] | undefined) {
  if (!values) return [];
  if (!Array.isArray(values)) bad("Choose items from the list.");
  return [...new Set(values.map((id) => String(id).trim()).filter(Boolean))];
}

function promoError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    bad("That code already exists.");
  }
  throw error;
}

function bad(message: string): never {
  throw new BadRequestException(message);
}
