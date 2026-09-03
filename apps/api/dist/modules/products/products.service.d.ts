import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
type ProductFilter = {
    category?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
    search?: string;
};
export declare class ProductsService {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(filters: ProductFilter): Promise<{
        items: {
            id: any;
            slug: any;
            name: any;
            tagline: any;
            category: any;
            isNew: any;
            isBestSeller: any;
            rating: any;
            reviewCount: any;
            startingPrice: number;
            compareAtPrice: number | null;
            primaryImage: any;
            soldOut: any;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findBySlug(slug: string): Promise<{}>;
    create(data: {
        name: string;
        slug: string;
        tagline?: string;
        description?: string;
        details?: string;
        materials?: string;
        care?: string;
        categoryId: string;
        isNew?: boolean;
        isBestSeller?: boolean;
        variants: {
            color: string;
            colorHex: string;
            size: string;
            priceInPaisa: number;
            compareAtPrice?: number;
            stock?: number;
        }[];
    }): Promise<{
        category: {
            id: string;
            slug: string;
            name: string;
            description: string;
            image: string | null;
            sortOrder: number;
        };
        variants: {
            id: string;
            productId: string;
            color: string;
            colorHex: string;
            size: string;
            priceInPaisa: number;
            compareAtPrice: number | null;
            stock: number;
            soldOut: boolean;
        }[];
        images: {
            id: string;
            sortOrder: number;
            productId: string;
            url: string;
            alt: string;
        }[];
    } & {
        id: string;
        slug: string;
        name: string;
        tagline: string;
        description: string;
        details: string;
        materials: string;
        care: string;
        categoryId: string;
        isNew: boolean;
        isBestSeller: boolean;
        rating: number;
        reviewCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, data: Partial<{
        name: string;
        slug: string;
        tagline: string;
        description: string;
        details: string;
        materials: string;
        care: string;
        categoryId: string;
        isNew: boolean;
        isBestSeller: boolean;
    }>): Promise<{
        category: {
            id: string;
            slug: string;
            name: string;
            description: string;
            image: string | null;
            sortOrder: number;
        };
        variants: {
            id: string;
            productId: string;
            color: string;
            colorHex: string;
            size: string;
            priceInPaisa: number;
            compareAtPrice: number | null;
            stock: number;
            soldOut: boolean;
        }[];
        images: {
            id: string;
            sortOrder: number;
            productId: string;
            url: string;
            alt: string;
        }[];
    } & {
        id: string;
        slug: string;
        name: string;
        tagline: string;
        description: string;
        details: string;
        materials: string;
        care: string;
        categoryId: string;
        isNew: boolean;
        isBestSeller: boolean;
        rating: number;
        reviewCount: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    remove(id: string): Promise<void>;
    getFilterOptions(categorySlug?: string): Promise<{
        sizes: string[];
        min: number;
        max: number;
    }>;
    private toListItem;
}
export {};
