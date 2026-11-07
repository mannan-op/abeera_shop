import { Controller, Get, Param, Query } from "@nestjs/common";

import { Roles } from "../../common/decorators";
import { CustomersService } from "./customers.service";

@Controller("admin/customers")
@Roles("ADMIN")
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Get()
  list(@Query("search") search?: string, @Query("sort") sort?: string, @Query("page") page?: string, @Query("pageSize") pageSize?: string) {
    return this.customers.list(search ?? "", sort ?? "recent", Number(page) || 1, Number(pageSize) || 25);
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.customers.detail(id);
  }
}
