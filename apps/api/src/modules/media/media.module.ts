import { Module } from "@nestjs/common";
import { MediaService } from "./media.service";
import { MediaAdminController, MediaController } from "./media.controller";

@Module({
  controllers: [MediaController, MediaAdminController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
