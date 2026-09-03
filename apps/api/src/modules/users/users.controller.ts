import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CurrentUser } from "../../common/decorators";

@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @Get("me")
  getProfile(@CurrentUser("id") userId: string) {
    return this.users.findById(userId);
  }

  @Get("me/addresses")
  getAddresses(@CurrentUser("id") userId: string) {
    return this.users.findAddresses(userId);
  }

  @Post("me/addresses")
  createAddress(
    @CurrentUser("id") userId: string,
    @Body() body: {
      label: string; name: string; line1: string; line2?: string;
      city: string; region: string; postalCode: string; phone: string;
    },
  ) {
    return this.users.createAddress(userId, body);
  }

  @Delete("me/addresses/:id")
  deleteAddress(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.users.deleteAddress(userId, id);
  }
}
