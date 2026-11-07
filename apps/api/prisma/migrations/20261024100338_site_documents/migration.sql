-- CreateTable
CREATE TABLE "site_documents" (
    "id" TEXT NOT NULL,
    "document" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_documents_pkey" PRIMARY KEY ("id")
);
