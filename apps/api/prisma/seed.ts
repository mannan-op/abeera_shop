import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@abeera.pk" },
    update: {},
    create: {
      email: "admin@abeera.pk",
      passwordHash: adminPassword,
      name: "Abeera Admin",
      phone: "+923001234567",
      role: "ADMIN",
    },
  });

  const categories = [
    { slug: "stitched-suits", name: "Stitched Suits", description: "Ready-to-wear suits for every occasion.", sortOrder: 1 },
    { slug: "accessories", name: "Accessories", description: "Handcrafted jewellery, clutches, and khussas.", sortOrder: 2 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
