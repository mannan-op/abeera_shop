import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CurrentUser } from "../../common/decorators";

@Controller("cart")
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  getCart(@CurrentUser("id") userId: string) {
    return this.cart.getCart(userId);
  }

  @Post()
  addItem(
    @CurrentUser("id") userId: string,
    @Body() body: { variantId: string; quantity?: number },
  ) {
    return this.cart.addItem(userId, body.variantId, body.quantity ?? 1);
  }

  @Patch(":id")
  updateQuantity(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() body: { quantity: number },
  ) {
    return this.cart.updateQuantity(userId, id, body.quantity);
  }

  @Delete(":id")
  removeItem(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.cart.removeItem(userId, id);
  }

  @Delete()
  clearCart(@CurrentUser("id") userId: string) {
    return this.cart.clearCart(userId);
  }
}
