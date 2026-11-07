import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { guestOrderSchema, orderLookupSchema } from "@abeera/shared";

import { OrdersService } from "./orders.service";
import { CurrentUser, Public } from "../../common/decorators";

@Controller("orders")
export class OrdersController {
  constructor(private orders: OrdersService) {}

  /** Guest checkout. No account needed. */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post()
  create(@Body() body: unknown) {
    const parsed = guestOrderSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? "Invalid order");
    }
    return this.orders.create(parsed.data);
  }

  /** Order number + email on the order. POST keeps the email out of URLs and logs. */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @HttpCode(200)
  @Post("lookup")
  lookup(@Body() body: unknown) {
    const parsed = orderLookupSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? "Enter your order number and email");
    }
    return this.orders.lookup(parsed.data);
  }

  /** Legacy: orders placed by signed-in customers before guest checkout. */
  @Get()
  findMine(@CurrentUser("id") userId: string, @Query("page") page?: number) {
    return this.orders.findByUser(userId, page ?? 1);
  }

  @Get(":id")
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.orders.findById(id, userId);
  }
}
