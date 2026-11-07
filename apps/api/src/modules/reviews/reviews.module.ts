import { Module } from "@nestjs/common";

import { ProductReviewsController, ReviewsAdminController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  controllers: [ProductReviewsController, ReviewsAdminController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
