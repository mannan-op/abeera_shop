import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";

import { Public } from "./common/decorators";
import { PrismaService } from "./prisma/prisma.service";
import { RedisService } from "./redis/redis.service";

async function checkStores(prisma: PrismaService, redis: RedisService) {
  const database = await pingDatabase(prisma);
  const redisStatus = await pingRedis(redis);
  const body = {
    status: database === "up" && redisStatus === "up" ? "ok" : "error",
    database,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  };
  if (body.status !== "ok") {
    throw new ServiceUnavailableException(body);
  }
  return body;
}

async function pingDatabase(prisma: PrismaService) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "up" as const;
  } catch {
    return "down" as const;
  }
}

async function pingRedis(redis: RedisService) {
  try {
    await redis.ping();
    return "up" as const;
  } catch {
    return "down" as const;
  }
}

@Controller("health")
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Public()
  @Get()
  check() {
    return checkStores(this.prisma, this.redis);
  }
}

/** Render's default probe is GET / when healthCheckPath is unset. Same check as /api/health. */
@Controller()
export class RootHealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Public()
  @Get()
  check() {
    return checkStores(this.prisma, this.redis);
  }
}

