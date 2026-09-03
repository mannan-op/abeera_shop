import { PrismaService } from "../../prisma/prisma.service";
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, addressId: string, paymentMethod: "JAZZCASH" | "EASYPAISA" | "COD"): Promise<{
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
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            amount: number;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            orderId: string;
        } | null;
        items: {
            productImage: string | null;
            id: string;
            size: string;
            color: string;
            variantId: string;
            quantity: number;
            productName: string;
            productSlug: string;
            price: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        orderNumber: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        shipping: number;
        tax: number;
        addressId: string;
    }>;
    findByUser(userId: string, page?: number, pageSize?: number): Promise<{
        items: ({
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
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                method: import(".prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                amount: number;
                rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
                orderId: string;
            } | null;
            items: {
                productImage: string | null;
                id: string;
                size: string;
                color: string;
                variantId: string;
                quantity: number;
                productName: string;
                productSlug: string;
                price: number;
                orderId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            total: number;
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            subtotal: number;
            shipping: number;
            tax: number;
            addressId: string;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findById(id: string, userId?: string): Promise<{
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
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            amount: number;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            orderId: string;
        } | null;
        items: {
            productImage: string | null;
            id: string;
            size: string;
            color: string;
            variantId: string;
            quantity: number;
            productName: string;
            productSlug: string;
            price: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        orderNumber: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        shipping: number;
        tax: number;
        addressId: string;
    }>;
    updateStatus(id: string, status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        orderNumber: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        shipping: number;
        tax: number;
        addressId: string;
    }>;
    findAll(page?: number, pageSize?: number): Promise<{
        items: ({
            user: {
                email: string;
                name: string;
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
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                method: import(".prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                amount: number;
                rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
                orderId: string;
            } | null;
            items: {
                productImage: string | null;
                id: string;
                size: string;
                color: string;
                variantId: string;
                quantity: number;
                productName: string;
                productSlug: string;
                price: number;
                orderId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            total: number;
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            subtotal: number;
            shipping: number;
            tax: number;
            addressId: string;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
}
