import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";

import { Public } from "./common/decorators";
import { PrismaService } from "./prisma/prisma.service";
import { RedisService } from "./redis/redis.service";

@Controller("health")
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Public()
  @Get()
  async check() {
    const database = await this.pingDatabase();
    const redis = await this.pingRedis();
    const body = {
      status: database === "up" && redis === "up" ? "ok" : "error",
      database,
      redis,
      timestamp: new Date().toISOString(),
    };
    if (body.status !== "ok") {
      throw new ServiceUnavailableException(body);
    }
    return body;
  }

  private async pingDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return "up" as const;
    } catch {
      return "down" as const;
    }
  }

  private async pingRedis() {
    try {
      await this.redis.ping();
      return "up" as const;
    } catch {
      return "down" as const;
    }
  }
}
