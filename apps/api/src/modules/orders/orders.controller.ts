import { BadRequestException, Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { createOrderSchema } from "@abeera/shared";

import { OrdersService } from "./orders.service";
import { CurrentUser } from "../../common/decorators";

@Controller("orders")
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@CurrentUser("id") userId: string, @Body() body: unknown) {
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? "Invalid order");
    }
    return this.orders.create(userId, parsed.data);
  }

  @Get()
  findMine(
    @CurrentUser("id") userId: string,
    @Query("page") page?: number,
  ) {
    return this.orders.findByUser(userId, page ?? 1);
  }

  @Get(":id")
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.orders.findById(id, userId);
  }
}
