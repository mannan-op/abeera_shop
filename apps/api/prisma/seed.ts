import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

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

async function main() {
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

  const seedPath = path.join(__dirname, "catalog-seed.json");
  const raw = JSON.parse(fs.readFileSync(seedPath, "utf8")) as {
    products: SeedProduct[];
  };

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
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });

      const variants = [];
      for (const color of product.colors) {
        for (const size of product.sizes) {
          variants.push({
            productId: existing.id,
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
      if (variants.length) {
        await prisma.productVariant.createMany({ data: variants });
      }

      const images = product.colors.flatMap((color) => color.images).slice(0, 6);
      if (images.length) {
        await prisma.productImage.createMany({
          data: images.map((url, index) => ({
            productId: existing.id,
            url,
            alt: product.name,
            sortOrder: index,
          })),
        });
      }
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

    const variants = [];
    for (const color of product.colors) {
      for (const size of product.sizes) {
        variants.push({
          productId: created.id,
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
    if (variants.length) {
      await prisma.productVariant.createMany({ data: variants });
    }

    const images = product.colors.flatMap((color) => color.images).slice(0, 6);
    if (images.length) {
      await prisma.productImage.createMany({
        data: images.map((url, index) => ({
          productId: created.id,
          url,
          alt: product.name,
          sortOrder: index,
        })),
      });
    }
  }

  console.log(`Seed completed: ${raw.products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
