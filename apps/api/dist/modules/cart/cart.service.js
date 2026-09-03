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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CartService = class CartService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
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
        return items.map((item) => ({
            id: item.id,
            variantId: item.variantId,
            productId: item.variant.productId,
            productName: item.variant.product.name,
            productSlug: item.variant.product.slug,
            productImage: item.variant.product.images[0]?.url ?? null,
            color: item.variant.color,
            size: item.variant.size,
            price: item.variant.priceInPaisa,
            quantity: item.quantity,
            stock: item.variant.stock,
        }));
    }
    async addItem(userId, variantId, quantity) {
        const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
        if (!variant)
            throw new common_1.NotFoundException("Variant not found");
        if (variant.soldOut || variant.stock < quantity) {
            throw new common_1.BadRequestException("Not enough stock");
        }
        await this.prisma.cartItem.upsert({
            where: { userId_variantId: { userId, variantId } },
            update: { quantity: { increment: quantity } },
            create: { userId, variantId, quantity },
        });
        return this.getCart(userId);
    }
    async updateQuantity(userId, itemId, quantity) {
        if (quantity <= 0)
            return this.removeItem(userId, itemId);
        const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, userId } });
        if (!item)
            throw new common_1.NotFoundException("Cart item not found");
        await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
        return this.getCart(userId);
    }
    async removeItem(userId, itemId) {
        await this.prisma.cartItem.deleteMany({ where: { id: itemId, userId } });
        return this.getCart(userId);
    }
    async clearCart(userId) {
        await this.prisma.cartItem.deleteMany({ where: { userId } });
        return [];
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map