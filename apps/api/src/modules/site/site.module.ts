import { Global, Module } from "@nestjs/common";

import { SiteDocumentsService } from "./site-documents.service";
import {
  ShopPageAdminController,
  ShopPageController,
  SiteSettingsAdminController,
  SiteSettingsController,
} from "./site.controller";

@Global()
@Module({
  controllers: [SiteSettingsController, SiteSettingsAdminController, ShopPageController, ShopPageAdminController],
  providers: [SiteDocumentsService],
  exports: [SiteDocumentsService],
})
export class SiteModule {}
