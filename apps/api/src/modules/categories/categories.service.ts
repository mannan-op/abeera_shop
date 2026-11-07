import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";

type CategoryInput = {
  name?: string;
  slug?: string;
  description?: string;
  image?: string | null;
  sortOrder?: number;
  showInShop?: boolean;
};

/** Virtual storefront views that are not database categories. */
const RESERVED_SLUGS = ["new-arrivals", "sale", "all"];

function clean(data: CategoryInput, creating: boolean): Prisma.CategoryUncheckedCreateInput | Prisma.CategoryUncheckedUpdateInput {
  if (!data || typeof data !== "object") throw new BadRequestException("Category data is missing.");
  const out: Record<string, unknown> = {};
  if (data.name !== undefined) {
    const name = String(data.name).trim();
    if (!name || name.length > 60) throw new BadRequestException("Name is required (60 characters max).");
    out.name = name;
  }
  if (data.slug !== undefined) {
    const slug = String(data.slug).trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BadRequestException("Link name may only use lowercase letters, numbers and dashes.");
    if (RESERVED_SLUGS.includes(slug)) throw new BadRequestException(`“${slug}” is reserved for a built-in shop view.`);
    out.slug = slug;
  }
  if (data.description !== undefined) out.description = String(data.description ?? "").slice(0, 400);
  if (data.image !== undefined) {
    const image = data.image ? String(data.image).trim() : null;
    if (image && !/^https?:\/\/\S+$/i.test(image) && !/^\/[^/]/.test(image)) {
      throw new BadRequestException("Image must be a link starting with https:// or /.");
    }
    out.image = image;
  }
  if (data.sortOrder !== undefined) out.sortOrder = Number(data.sortOrder) || 0;
  if (data.showInShop !== undefined) out.showInShop = Boolean(data.showInShop);
  if (creating && (!out.name || !out.slug)) throw new BadRequestException("Name and link name are required.");
  return out as Prisma.CategoryUncheckedCreateInput;
}

function friendly(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") throw new BadRequestException("Another category already uses that link name.");
    if (error.code === "P2025") throw new NotFoundException("Category not found");
  }
  throw error;
}

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redis.getJson<unknown[]>("categories:all");
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    await this.redis.setJson("categories:all", categories, 3600);
    return categories;
  }

  /** Admin list with live product counts. */
  async findAllWithCounts() {
    const rows = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
    });
    return rows.map(({ _count, ...row }) => ({ ...row, productCount: _count.products }));
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async create(data: CategoryInput) {
    const input = clean(data, true) as Prisma.CategoryUncheckedCreateInput;
    if (data.sortOrder === undefined) {
      const last = await this.prisma.category.aggregate({ _max: { sortOrder: true } });
      input.sortOrder = (last._max.sortOrder ?? 0) + 1;
    }
    const category = await this.prisma.category.create({ data: input }).catch(friendly);
    await this.redis.del("categories:all");
    return category;
  }

  async update(id: string, data: CategoryInput) {
    const category = await this.prisma.category
      .update({ where: { id }, data: clean(data, false) as Prisma.CategoryUncheckedUpdateInput })
      .catch(friendly);
    await this.redis.del("categories:all");
    return category;
  }

  /** Saves a new order: `ids` lists every category, first to last. */
  async reorder(ids: string[]) {
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      throw new BadRequestException("Send the category ids in their new order.");
    }
    const existing = await this.prisma.category.findMany({ select: { id: true } });
    const known = new Set(existing.map((c) => c.id));
    if (ids.length !== known.size || new Set(ids).size !== ids.length || ids.some((id) => !known.has(id))) {
      throw new BadRequestException("The order must list every category exactly once. Reload and try again.");
    }
    await this.prisma.$transaction(ids.map((id, index) => this.prisma.category.update({ where: { id }, data: { sortOrder: index + 1 } })));
    await this.redis.del("categories:all");
    return this.findAllWithCounts();
  }

  async remove(id: string) {
    const count = await this.prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      const live = await this.prisma.product.count({ where: { categoryId: id, deletedAt: null } });
      throw new BadRequestException(
        live > 0
          ? `Move this category's ${live} product${live === 1 ? "" : "s"} to another category before deleting it.`
          : "Deleted products still point at this category, so it can't be removed. Hide it from the shop instead.",
      );
    }
    await this.prisma.category.delete({ where: { id } }).catch(friendly);
    await this.redis.del("categories:all");
  }
}
