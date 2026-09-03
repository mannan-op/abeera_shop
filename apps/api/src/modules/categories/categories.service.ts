import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redis.getJson<any[]>("categories:all");
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });

    await this.redis.setJson("categories:all", categories, 3600);
    return categories;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async create(data: { name: string; slug: string; description?: string; image?: string; sortOrder?: number }) {
    const category = await this.prisma.category.create({ data });
    await this.redis.del("categories:all");
    return category;
  }

  async update(id: string, data: Partial<{ name: string; slug: string; description: string; image: string; sortOrder: number }>) {
    const category = await this.prisma.category.update({ where: { id }, data });
    await this.redis.del("categories:all");
    return category;
  }

  async remove(id: string) {
    await this.prisma.category.delete({ where: { id } });
    await this.redis.del("categories:all");
  }
}
