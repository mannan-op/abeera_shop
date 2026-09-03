import { ProductsService } from "../products/products.service";
import { CategoriesService } from "../categories/categories.service";
import { OrdersService } from "../orders/orders.service";
import { PrismaService } from "../../prisma/prisma.service";
export declare class AdminController {
    private products;
    private categories;
    private orders;
    private prisma;
    constructor(products: ProductsService, categories: CategoriesService, orders: OrdersService, prisma: PrismaService);
    dashboard(): Promise<{
        totalProducts: number;
        totalOrders: number;
        totalRevenue: number;
        recentOrders: ({
            user: {
                name: string;
                email: string;
            };
            address: {
                id: string;
                name: string;
                phone: string;
                userId: string;
                label: string;
                line1: string;
                line2: string | null;
                city: string;
                region: string;
                postalCode: string;
                country: string;
            };
            items: {
                id: string;
                color: string;
                size: string;
                productImage: string | null;
                orderId: string;
                variantId: string;
                productName: string;
                productSlug: string;
                price: number;
                quantity: number;
            }[];
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                orderId: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                amount: number;
                rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            total: number;
            subtotal: number;
            shipping: number;
            tax: number;
            orderNumber: string;
            addressId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
        })[];
    }>;
    createProduct(body: any): Promise<{
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
    updateProduct(id: string, body: any): Promise<{
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
    deleteProduct(id: string): Promise<void>;
    createCategory(body: {
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
    updateCategory(id: string, body: any): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        image: string | null;
        sortOrder: number;
    }>;
    deleteCategory(id: string): Promise<void>;
    getAllOrders(page?: number): Promise<{
        items: ({
            user: {
                name: string;
                email: string;
            };
            address: {
                id: string;
                name: string;
                phone: string;
                userId: string;
                label: string;
                line1: string;
                line2: string | null;
                city: string;
                region: string;
                postalCode: string;
                country: string;
            };
            items: {
                id: string;
                color: string;
                size: string;
                productImage: string | null;
                orderId: string;
                variantId: string;
                productName: string;
                productSlug: string;
                price: number;
                quantity: number;
            }[];
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                orderId: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                amount: number;
                rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            total: number;
            subtotal: number;
            shipping: number;
            tax: number;
            orderNumber: string;
            addressId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getOrder(id: string): Promise<{
        address: {
            id: string;
            name: string;
            phone: string;
            userId: string;
            label: string;
            line1: string;
            line2: string | null;
            city: string;
            region: string;
            postalCode: string;
            country: string;
        };
        items: {
            id: string;
            color: string;
            size: string;
            productImage: string | null;
            orderId: string;
            variantId: string;
            productName: string;
            productSlug: string;
            price: number;
            quantity: number;
        }[];
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            amount: number;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        subtotal: number;
        shipping: number;
        tax: number;
        orderNumber: string;
        addressId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
    }>;
    updateOrderStatus(id: string, body: {
        status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        subtotal: number;
        shipping: number;
        tax: number;
        orderNumber: string;
        addressId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
    }>;
}
