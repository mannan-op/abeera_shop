import "reflect-metadata";

import assert from "node:assert/strict";
import * as fs from "node:fs";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import { resolveCatalogSeedPath } from "../src/catalog/run-seed";
import { authorizeSeed, readHeader } from "../src/catalog/seed-access";
import { SeedController } from "../src/modules/admin/seed.controller";

const token = "seed-token-for-tests";

assert.equal(
  authorizeSeed({ seedToken: undefined, authorization: `Bearer ${token}`, seedHeader: undefined }),
  "disabled",
);
assert.equal(
  authorizeSeed({ seedToken: "   ", authorization: `Bearer ${token}`, seedHeader: undefined }),
  "disabled",
);
assert.equal(
  authorizeSeed({ seedToken: token, authorization: undefined, seedHeader: undefined }),
  "forbidden",
);
assert.equal(
  authorizeSeed({ seedToken: token, authorization: "Bearer wrong-token", seedHeader: undefined }),
  "forbidden",
);
assert.equal(
  authorizeSeed({ seedToken: token, authorization: `Bearer ${token}`, seedHeader: undefined }),
  "ok",
);
assert.equal(
  authorizeSeed({ seedToken: token, authorization: `bearer ${token}`, seedHeader: undefined }),
  "ok",
);
assert.equal(
  authorizeSeed({ seedToken: token, authorization: undefined, seedHeader: token }),
  "ok",
);
assert.equal(
  authorizeSeed({ seedToken: token, authorization: "Bearer short", seedHeader: token }),
  "ok",
);
assert.equal(readHeader(["", "  ", token]), token);

const seedFile = resolveCatalogSeedPath();
assert.equal(fs.existsSync(seedFile), true);
assert.match(seedFile, /catalog-seed\.json$/);

async function assertControllerRefusesWithoutDatabase() {
  const previous = process.env.SEED_TOKEN;
  delete process.env.SEED_TOKEN;
  const controller = new SeedController({} as never);
  await assert.rejects(() => controller.seed(), (error: unknown) => error instanceof NotFoundException);

  process.env.SEED_TOKEN = token;
  await assert.rejects(
    () => controller.seed("Bearer wrong-token"),
    (error: unknown) => error instanceof ForbiddenException,
  );
  await assert.rejects(
    () => controller.seed(undefined, "wrong-token"),
    (error: unknown) => error instanceof ForbiddenException,
  );

  if (previous === undefined) delete process.env.SEED_TOKEN;
  else process.env.SEED_TOKEN = previous;
}

void assertControllerRefusesWithoutDatabase()
  .then(() => {
    console.log("seed-access tests passed");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
