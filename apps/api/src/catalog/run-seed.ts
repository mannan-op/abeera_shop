import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

type SeedProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details: string;
  materials: string;
  care: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  soldOut: boolean;
  colors: { name: string; hex: string; images: string[] }[];
  sizes: string[];
};

type VariantSeed = {
  productId: string;
  color: string;
  colorHex: string;
  size: string;
  priceInPaisa: number;
  compareAtPrice: number | null;
  stock: number;
  soldOut: boolean;
};

export type CatalogSeedResult = {
  products: number;
  categories: number;
};

/** Same catalog file `prisma/seed.ts` reads, from source or from `dist/`. */
export function resolveCatalogSeedPath(): string {
  const candidates = [
    path.join(__dirname, "../../prisma/catalog-seed.json"),
    path.join(process.cwd(), "prisma/catalog-seed.json"),
    path.join(process.cwd(), "apps/api/prisma/catalog-seed.json"),
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error("catalog-seed.json was not found");
  }
  return found;
}

/**
 * Upserts the admin user, categories, and catalog from `catalog-seed.json`.
 * `prisma/seed.ts` and `POST /api/admin/seed` both call this.
 */
export async function runCatalogSeed(prisma: PrismaClient): Promise<CatalogSeedResult> {
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_SEED_PASSWORD ?? "ChangeMeNow!2026",
    10,
  );

  await prisma.user.upsert({
    where: { email: "admin@abeera.pk" },
    update: {
      passwordHash: adminPassword,
      role: "ADMIN",
    },
    create: {
      email: "admin@abeera.pk",
      passwordHash: adminPassword,
      name: "Abeera Admin",
      phone: "+923001234567",
      role: "ADMIN",
    },
  });

  const categoryDefs = [
    {
      slug: "stitched-suits",
      name: "Stitched Suits",
      description: "Ready-to-wear suits for every occasion.",
      sortOrder: 1,
    },
    {
      slug: "accessories",
      name: "Accessories",
      description: "Handcrafted jewellery, clutches, and khussas.",
      sortOrder: 2,
    },
  ];

  const categoryIds = new Map<string, string>();
  for (const cat of categoryDefs) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
      create: cat,
    });
    categoryIds.set(cat.slug, row.id);
  }

  const raw = JSON.parse(fs.readFileSync(resolveCatalogSeedPath(), "utf8")) as {
    products: SeedProduct[];
  };

  let products = 0;
  for (const product of raw.products) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) continue;

    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: product.name,
          tagline: product.tagline,
          description: product.description,
          details: product.details,
          materials: product.materials,
          care: product.care,
          categoryId,
          isNew: product.isNew,
          isBestSeller: product.isBestSeller,
          rating: product.rating,
          reviewCount: product.reviewCount,
          deletedAt: null,
        },
      });
      await replaceVariantsAndImages(prisma, existing.id, product);
      products += 1;
      continue;
    }

    const created = await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        details: product.details,
        materials: product.materials,
        care: product.care,
        categoryId,
        isNew: product.isNew,
        isBestSeller: product.isBestSeller,
        rating: product.rating,
        reviewCount: product.reviewCount,
      },
    });
    await replaceVariantsAndImages(prisma, created.id, product);
    products += 1;
  }

  return { products, categories: categoryDefs.length };
}

async function replaceVariantsAndImages(
  prisma: PrismaClient,
  productId: string,
  product: SeedProduct,
) {
  await prisma.productVariant.deleteMany({ where: { productId } });
  await prisma.productImage.deleteMany({ where: { productId } });

  const variants = variantsFor(productId, product);
  if (variants.length) {
    await prisma.productVariant.createMany({ data: variants });
  }

  const images = product.colors.flatMap((color) => color.images).slice(0, 6);
  if (images.length) {
    await prisma.productImage.createMany({
      data: images.map((url, index) => ({
        productId,
        url,
        alt: product.name,
        sortOrder: index,
      })),
    });
  }
}

function variantsFor(productId: string, product: SeedProduct): VariantSeed[] {
  const variants: VariantSeed[] = [];
  for (const color of product.colors) {
    for (const size of product.sizes) {
      variants.push({
        productId,
        color: color.name,
        colorHex: color.hex,
        size,
        priceInPaisa: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.soldOut ? 0 : 25,
        soldOut: product.soldOut,
      });
    }
  }
  return variants;
}
