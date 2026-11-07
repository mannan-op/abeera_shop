import { BadRequestException, Body, Controller, Get, Put } from "@nestjs/common";
import { shopPageSchema, siteIssueMessage, siteSettingsSchema } from "@abeera/shared";

import { Public, Roles } from "../../common/decorators";
import { SHOP_PAGE_DOC, SITE_SETTINGS_DOC, SiteDocumentsService } from "./site-documents.service";

@Controller("site-settings")
export class SiteSettingsController {
  constructor(private docs: SiteDocumentsService) {}

  @Public()
  @Get()
  get() {
    return this.docs.get(SITE_SETTINGS_DOC);
  }
}

@Controller("admin/site-settings")
@Roles("ADMIN")
export class SiteSettingsAdminController {
  constructor(private docs: SiteDocumentsService) {}

  @Get()
  get() {
    return this.docs.get(SITE_SETTINGS_DOC);
  }

  @Put()
  save(@Body() body: unknown) {
    const parsed = siteSettingsSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(siteIssueMessage(parsed.error));
    return this.docs.save(SITE_SETTINGS_DOC, parsed.data);
  }
}

@Controller("shop-page")
export class ShopPageController {
  constructor(private docs: SiteDocumentsService) {}

  @Public()
  @Get()
  get() {
    return this.docs.get(SHOP_PAGE_DOC);
  }
}

@Controller("admin/shop-page")
@Roles("ADMIN")
export class ShopPageAdminController {
  constructor(private docs: SiteDocumentsService) {}

  @Get()
  get() {
    return this.docs.get(SHOP_PAGE_DOC);
  }

  @Put()
  save(@Body() body: unknown) {
    const parsed = shopPageSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(siteIssueMessage(parsed.error));
    return this.docs.save(SHOP_PAGE_DOC, parsed.data);
  }
}
