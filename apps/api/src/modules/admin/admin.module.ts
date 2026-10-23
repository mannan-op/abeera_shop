import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { SeedController } from "./seed.controller";
import { ProductsModule } from "../products/products.module";
import { CategoriesModule } from "../categories/categories.module";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [ProductsModule, CategoriesModule, OrdersModule],
  controllers: [AdminController, SeedController],
})
export class AdminModule {}
