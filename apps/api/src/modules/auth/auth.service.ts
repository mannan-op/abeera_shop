import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";

import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
      },
    });

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.requireSecret("JWT_REFRESH_SECRET"),
      });

      const blacklisted = await this.redis.get(`bl:${refreshToken}`);
      if (blacklisted) throw new UnauthorizedException("Token revoked");

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.deletedAt) throw new UnauthorizedException("User not found");

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(refreshToken: string) {
    await this.redis.set(`bl:${refreshToken}`, "1", 7 * 24 * 60 * 60);
  }

  private requireSecret(key: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET") {
    const value = this.config.get<string>(key);
    if (!value) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(`${key} is required in production`);
      }
      return key === "JWT_ACCESS_SECRET"
        ? "dev-access-secret-local-only"
        : "dev-refresh-secret-local-only";
    }
    return value;
  }

  private async generateTokens(user: { id: string; email: string; role: string }) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.requireSecret("JWT_ACCESS_SECRET"),
        expiresIn: "15m",
      }),
      this.jwt.signAsync(payload, {
        secret: this.requireSecret("JWT_REFRESH_SECRET"),
        expiresIn: "7d",
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
