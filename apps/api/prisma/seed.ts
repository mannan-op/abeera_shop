import { PrismaClient } from "@prisma/client";

import { runCatalogSeed } from "../src/catalog/run-seed";

const prisma = new PrismaClient();

runCatalogSeed(prisma)
  .then((result) => {
    console.log(
      `Seed completed: ${result.products} products. Homepage ${result.homepageSeeded ? "inserted" : "already present"}.`,
    );
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
