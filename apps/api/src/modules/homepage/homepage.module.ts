import { Module } from "@nestjs/common";

import { HomepageAdminController } from "./homepage-admin.controller";
import { HomepageController } from "./homepage.controller";
import { HomepageService } from "./homepage.service";

@Module({
  controllers: [HomepageController, HomepageAdminController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}
