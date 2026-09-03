import { OrdersService } from "./orders.service";
export declare class OrdersController {
    private orders;
    constructor(orders: OrdersService);
    create(userId: string, body: {
        addressId: string;
        paymentMethod: "JAZZCASH" | "EASYPAISA" | "COD";
    }): Promise<{
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
    findMine(userId: string, page?: number): Promise<{
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
    findOne(userId: string, id: string): Promise<{
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
}
