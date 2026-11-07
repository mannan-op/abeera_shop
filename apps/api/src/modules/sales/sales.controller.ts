import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { Public, Roles } from "../../common/decorators";
import { SalesService, type CampaignInput, type PromoInput } from "./sales.service";

@Controller("sales")
export class SalesController {
  constructor(private sales: SalesService) {}

  @Public()
  @Get("banner")
  banner() {
    return this.sales.banner();
  }
}

@Controller("admin/sales")
@Roles("ADMIN")
export class SalesAdminController {
  constructor(private sales: SalesService) {}

  @Get()
  list() {
    return this.sales.listCampaigns();
  }

  @Post()
  create(@Body() body: CampaignInput) {
    return this.sales.createCampaign(body);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.sales.getCampaign(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: CampaignInput) {
    return this.sales.updateCampaign(id, body);
  }

  @Post(":id/end")
  end(@Param("id") id: string) {
    return this.sales.endCampaign(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sales.removeCampaign(id);
  }
}

@Controller("admin/promos")
@Roles("ADMIN")
export class PromosAdminController {
  constructor(private sales: SalesService) {}

  @Get()
  list() {
    return this.sales.listPromos();
  }

  @Post()
  create(@Body() body: PromoInput) {
    return this.sales.createPromo(body);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.sales.getPromo(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: PromoInput) {
    return this.sales.updatePromo(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sales.removePromo(id);
  }
}
