import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { Roles } from "../../common/decorators";
import { ProductsService } from "../products/products.service";
import { CategoriesService } from "../categories/categories.service";
import { OrdersService } from "../orders/orders.service";
import { PrismaService } from "../../prisma/prisma.service";

@Controller("admin")
@Roles("ADMIN")
export class AdminController {
  constructor(
    private products: ProductsService,
    private categories: CategoriesService,
    private orders: OrdersService,
    private prisma: PrismaService,
  ) {}

  @Get("dashboard")
  async dashboard() {
    const [totalProducts, totalOrders, revenueResult] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true } }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      include: { items: true, payment: true, address: true },
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

  // Products CRUD
  @Post("products")
  createProduct(@Body() body: Parameters<ProductsService["create"]>[0]) {
    return this.products.create(body);
  }

  @Patch("products/:id")
  updateProduct(@Param("id") id: string, @Body() body: Parameters<ProductsService["update"]>[1]) {
    return this.products.update(id, body);
  }

  @Delete("products/:id")
  deleteProduct(@Param("id") id: string) {
    return this.products.remove(id);
  }

  // Categories CRUD
  @Get("categories")
  listCategories() {
    return this.categories.findAllWithCounts();
  }

  @Post("categories")
  createCategory(@Body() body: { name: string; slug: string; description?: string; image?: string; sortOrder?: number; showInShop?: boolean }) {
    return this.categories.create(body);
  }

  @Put("categories/order")
  reorderCategories(@Body() body: { ids: string[] }) {
    return this.categories.reorder(body?.ids);
  }

  @Patch("categories/:id")
  updateCategory(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.categories.update(id, body);
  }

  @Delete("categories/:id")
  deleteCategory(@Param("id") id: string) {
    return this.categories.remove(id);
  }

  // Orders
  @Get("orders")
  getAllOrders(@Query("page") page?: number) {
    return this.orders.findAll(page ?? 1);
  }

  @Get("orders/:id")
  getOrder(@Param("id") id: string) {
    return this.orders.findById(id);
  }

  @Patch("orders/:id/status")
  updateOrderStatus(
    @Param("id") id: string,
    @Body() body: { status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
  ) {
    return this.orders.updateStatus(id, body.status);
  }
}
