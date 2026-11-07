import { Module } from "@nestjs/common";

import { PromosAdminController, SalesAdminController, SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";

@Module({
  controllers: [SalesController, SalesAdminController, PromosAdminController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
