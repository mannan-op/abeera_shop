import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private redis;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, redis: RedisService);
    register(data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    logout(refreshToken: string): Promise<void>;
    private generateTokens;
}
