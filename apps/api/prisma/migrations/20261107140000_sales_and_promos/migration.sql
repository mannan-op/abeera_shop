-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "SaleScope" AS ENUM ('ALL', 'CATEGORIES', 'PRODUCTS');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "promoCode" TEXT;

-- CreateTable
CREATE TABLE "sale_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scope" "SaleScope" NOT NULL DEFAULT 'ALL',
    "bannerText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_campaign_categories" (
    "campaignId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "sale_campaign_categories_pkey" PRIMARY KEY ("campaignId","categoryId")
);

-- CreateTable
CREATE TABLE "sale_campaign_products" (
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "sale_campaign_products_pkey" PRIMARY KEY ("campaignId","productId")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "minSubtotal" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sale_campaigns_active_startsAt_endsAt_idx" ON "sale_campaigns"("active", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "sale_campaign_categories_categoryId_idx" ON "sale_campaign_categories"("categoryId");

-- CreateIndex
CREATE INDEX "sale_campaign_products_productId_idx" ON "sale_campaign_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- AddForeignKey
ALTER TABLE "sale_campaign_categories" ADD CONSTRAINT "sale_campaign_categories_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "sale_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_campaign_categories" ADD CONSTRAINT "sale_campaign_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_campaign_products" ADD CONSTRAINT "sale_campaign_products_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "sale_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_campaign_products" ADD CONSTRAINT "sale_campaign_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The old hardcoded ABEERA10 (10% off, no minimum, no expiry, no usage cap).
INSERT INTO "promo_codes" (
    "id",
    "code",
    "discountType",
    "amount",
    "minSubtotal",
    "usedCount",
    "active",
    "createdAt",
    "updatedAt"
) VALUES (
    'abeera10-legacy-promo',
    'ABEERA10',
    'PERCENT',
    10,
    0,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ("code") DO NOTHING;
