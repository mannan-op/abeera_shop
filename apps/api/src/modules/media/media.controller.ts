import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { Roles } from "../../common/decorators";
import { MediaService } from "./media.service";

@Controller("media")
export class MediaController {
  constructor(private media: MediaService) {}

  /** Uploads to Cloudinary and records the image in the media library. */
  @Post("upload")
  @Roles("ADMIN")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body("alt") alt?: string) {
    const asset = await this.media.uploadAndRecord(file, alt ?? "");
    return {
      id: asset.id,
      url: asset.url,
      publicId: asset.publicId,
      width: asset.width,
      height: asset.height,
    };
  }
}

@Controller("admin/media")
@Roles("ADMIN")
export class MediaAdminController {
  constructor(private media: MediaService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("source") source?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.media.list(search, source, Number(page) || 1, Number(pageSize) || 60);
  }

  @Get("status")
  status() {
    return { cloudinaryConfigured: this.media.configured };
  }

  @Post()
  addLink(@Body() body: { url: string; alt?: string }) {
    return this.media.addLink(body?.url, body?.alt);
  }

  @Get(":id/usage")
  usage(@Param("id") id: string) {
    return this.media.usage(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: { alt?: string }) {
    return this.media.update(id, body ?? {});
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.media.remove(id);
  }
}
