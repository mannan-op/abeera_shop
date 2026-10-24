import {
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from "@nestjs/common";

import { runCatalogSeed } from "../../catalog/run-seed";
import { authorizeSeed, readHeader, type SeedDecision } from "../../catalog/seed-access";
import { Public } from "../../common/decorators";
import { PrismaService } from "../../prisma/prisma.service";

@Controller("admin")
export class SeedController {
  private inflight: ReturnType<typeof runCatalogSeed> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * One-shot catalog fill. Runs the same upsert as `prisma/seed.ts`.
   * 404 when SEED_TOKEN is unset. 403 when the bearer token or X-Seed-Token does not match.
   */
  @Public()
  @Post("seed")
  @HttpCode(200)
  async seed(
    @Headers("authorization") authorization?: string | string[],
    @Headers("x-seed-token") seedHeader?: string | string[],
  ) {
    const decision = authorizeSeed({
      seedToken: process.env.SEED_TOKEN,
      authorization: readHeader(authorization),
      seedHeader: readHeader(seedHeader),
    });
    this.assertAllowed(decision);

    try {
      const result = await this.runOnce();
      return {
        ok: true,
        products: result.products,
        categories: result.categories,
        homepageSeeded: result.homepageSeeded,
      };
    } catch (error) {
      console.error("Catalog seed failed", error instanceof Error ? error.message : error);
      throw new InternalServerErrorException("Catalog seed failed");
    }
  }

  private assertAllowed(decision: SeedDecision) {
    switch (decision) {
      case "disabled":
        throw new NotFoundException();
      case "forbidden":
        throw new ForbiddenException();
      case "ok":
        return;
      default: {
        const unreachable: never = decision;
        throw new NotFoundException(unreachable);
      }
    }
  }

  private runOnce() {
    if (!this.inflight) {
      this.inflight = runCatalogSeed(this.prisma).finally(() => {
        this.inflight = null;
      });
    }
    return this.inflight;
  }
}
