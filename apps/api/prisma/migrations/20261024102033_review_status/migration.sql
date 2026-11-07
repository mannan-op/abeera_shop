-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN');

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED';

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- Existing reviews were already visible: keep them PUBLISHED; new reviews wait for moderation.
ALTER TABLE "reviews" ALTER COLUMN "status" SET DEFAULT 'PENDING';
