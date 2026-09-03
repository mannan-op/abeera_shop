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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../../common/decorators");
const products_service_1 = require("../products/products.service");
const categories_service_1 = require("../categories/categories.service");
const orders_service_1 = require("../orders/orders.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminController = class AdminController {
    constructor(products, categories, orders, prisma) {
        this.products = products;
        this.categories = categories;
        this.orders = orders;
        this.prisma = prisma;
    }
    async dashboard() {
        const [totalProducts, totalOrders, revenueResult] = await Promise.all([
            this.prisma.product.count({ where: { deletedAt: null } }),
            this.prisma.order.count(),
            this.prisma.order.aggregate({ _sum: { total: true } }),
        ]);
        const recentOrders = await this.prisma.order.findMany({
            include: { items: true, payment: true, address: true, user: { select: { name: true, email: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        return {
            totalProducts,
            totalOrders,
            totalRevenue: revenueResult._sum.total ?? 0,
            recentOrders,
        };
    }
    createProduct(body) {
        return this.products.create(body);
    }
    updateProduct(id, body) {
        return this.products.update(id, body);
    }
    deleteProduct(id) {
        return this.products.remove(id);
    }
    createCategory(body) {
        return this.categories.create(body);
    }
    updateCategory(id, body) {
        return this.categories.update(id, body);
    }
    deleteCategory(id) {
        return this.categories.remove(id);
    }
    getAllOrders(page) {
        return this.orders.findAll(page ?? 1);
    }
    getOrder(id) {
        return this.orders.findById(id);
    }
    updateOrderStatus(id, body) {
        return this.orders.updateStatus(id, body.status);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)("dashboard"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Post)("products"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)("products/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)("products/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Post)("categories"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)("categories/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)("categories/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)("orders"),
    __param(0, (0, common_1.Query)("page")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)("orders/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Patch)("orders/:id/status"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateOrderStatus", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)("admin"),
    (0, decorators_1.Roles)("ADMIN"),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        categories_service_1.CategoriesService,
        orders_service_1.OrdersService,
        prisma_service_1.PrismaService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map