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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
const productInclude = {
    category: true,
    variants: true,
    images: { orderBy: { sortOrder: "asc" } },
};
let ProductsService = class ProductsService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(filters) {
        const page = filters.page ?? 1;
        const pageSize = filters.pageSize ?? 24;
        const skip = (page - 1) * pageSize;
        const where = { deletedAt: null };
        if (filters.category) {
            where.category = { slug: filters.category };
        }
        if (filters.size) {
            where.variants = { some: { size: filters.size, soldOut: false } };
        }
        if (filters.minPrice || filters.maxPrice) {
            where.variants = {
                ...(where.variants ?? {}),
                some: {
                    ...(where.variants?.some ?? {}),
                    priceInPaisa: {
                        ...(filters.minPrice ? { gte: filters.minPrice } : {}),
                        ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
                    },
                },
            };
        }
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
                { tagline: { contains: filters.search, mode: "insensitive" } },
            ];
        }
        let orderBy = { createdAt: "desc" };
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
    async findBySlug(slug) {
        const cacheKey = `product:${slug}`;
        const cached = await this.redis.getJson(cacheKey);
        if (cached)
            return cached;
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
        if (!product)
            throw new common_1.NotFoundException("Product not found");
        await this.redis.setJson(cacheKey, product, 600);
        return product;
    }
    async create(data) {
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
    async update(id, data) {
        const product = await this.prisma.product.update({
            where: { id },
            data,
            include: productInclude,
        });
        await this.redis.del(`product:${product.slug}`);
        return product;
    }
    async remove(id) {
        const product = await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await this.redis.del(`product:${product.slug}`);
    }
    async getFilterOptions(categorySlug) {
        const where = { deletedAt: null };
        if (categorySlug)
            where.category = { slug: categorySlug };
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
    toListItem(product) {
        const prices = product.variants.map((v) => v.priceInPaisa);
        const comparePrices = product.variants.map((v) => v.compareAtPrice).filter(Boolean);
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
            startingPrice: prices.length > 0 ? Math.min(...prices) : 0,
            compareAtPrice: comparePrices.length > 0 ? Math.min(...comparePrices) : null,
            primaryImage: product.images[0]?.url ?? null,
            soldOut: allSoldOut,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ProductsService);
//# sourceMappingURL=products.service.js.map