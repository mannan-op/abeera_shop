import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
export declare class CategoriesService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(): Promise<any[]>;
    findBySlug(slug: string): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        image: string | null;
        sortOrder: number;
    }>;
    create(data: {
        name: string;
        slug: string;
        description?: string;
        image?: string;
        sortOrder?: number;
    }): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        image: string | null;
        sortOrder: number;
    }>;
    update(id: string, data: Partial<{
        name: string;
        slug: string;
        description: string;
        image: string;
        sortOrder: number;
    }>): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        image: string | null;
        sortOrder: number;
    }>;
    remove(id: string): Promise<void>;
}
