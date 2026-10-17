-- AlterTable
ALTER TABLE "orders" ADD COLUMN "shippingMethod" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "orders" ADD COLUMN "discount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_userId_idempotencyKey_key" ON "orders"("userId", "idempotencyKey");
