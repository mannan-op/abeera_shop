import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CurrentUser } from "../../common/decorators";

@Controller("orders")
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(
    @CurrentUser("id") userId: string,
    @Body() body: { addressId: string; paymentMethod: "JAZZCASH" | "EASYPAISA" | "COD" },
  ) {
    return this.orders.create(userId, body.addressId, body.paymentMethod);
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
