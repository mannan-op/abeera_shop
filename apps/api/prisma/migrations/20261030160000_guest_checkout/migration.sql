-- Guest checkout: orders no longer need an account. Existing orders keep their user link
-- and get the customer's name/email/phone copied from the account and delivery address.

-- AlterTable: addresses can belong to a guest order
ALTER TABLE "addresses" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable: orders
ALTER TABLE "orders" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "orders" ADD COLUMN "customerName" TEXT;
ALTER TABLE "orders" ADD COLUMN "customerEmail" TEXT;
ALTER TABLE "orders" ADD COLUMN "customerPhone" TEXT;

UPDATE "orders" o
SET "customerName"  = COALESCE(NULLIF(a."name", ''), u."name"),
    "customerEmail" = LOWER(u."email"),
    "customerPhone" = COALESCE(NULLIF(a."phone", ''), u."phone", '')
FROM "users" u, "addresses" a
WHERE u."id" = o."userId" AND a."id" = o."addressId";

ALTER TABLE "orders" ALTER COLUMN "customerName" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "customerEmail" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "customerPhone" SET NOT NULL;

-- CreateIndex
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");
CREATE UNIQUE INDEX "orders_customerEmail_idempotencyKey_key" ON "orders"("customerEmail", "idempotencyKey");
