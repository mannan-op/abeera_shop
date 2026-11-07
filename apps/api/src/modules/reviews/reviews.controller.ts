import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";

import { CurrentUser, Public, Roles } from "../../common/decorators";
import { ReviewsService } from "./reviews.service";

@Controller("products/:slug/reviews")
export class ProductReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Public()
  @Get()
  list(@Param("slug") slug: string) {
    return this.reviews.published(slug);
  }

  /** Signed-in customers; the review waits for approval. */
  @Post()
  submit(@CurrentUser("id") userId: string, @Param("slug") slug: string, @Body() body: { rating?: number; title?: string; body?: string }) {
    return this.reviews.submit(userId, slug, body);
  }
}

@Controller("admin/reviews")
@Roles("ADMIN")
export class ReviewsAdminController {
  constructor(private reviews: ReviewsService) {}

  @Get()
  list(@Query("status") status?: string, @Query("search") search?: string) {
    return this.reviews.adminList(status, search);
  }

  @Patch(":id")
  setStatus(@Param("id") id: string, @Body() body: { status: string }) {
    return this.reviews.setStatus(id, body?.status);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.reviews.remove(id);
  }
}
