"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
let CategoriesService = class CategoriesService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll() {
        const cached = await this.redis.getJson("categories:all");
        if (cached)
            return cached;
        const categories = await this.prisma.category.findMany({
            orderBy: { sortOrder: "asc" },
        });
        await this.redis.setJson("categories:all", categories, 3600);
        return categories;
    }
    async findBySlug(slug) {
        const category = await this.prisma.category.findUnique({ where: { slug } });
        if (!category)
            throw new common_1.NotFoundException("Category not found");
        return category;
    }
    async create(data) {
        const category = await this.prisma.category.create({ data });
        await this.redis.del("categories:all");
        return category;
    }
    async update(id, data) {
        const category = await this.prisma.category.update({ where: { id }, data });
        await this.redis.del("categories:all");
        return category;
    }
    async remove(id) {
        await this.prisma.category.delete({ where: { id } });
        await this.redis.del("categories:all");
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map