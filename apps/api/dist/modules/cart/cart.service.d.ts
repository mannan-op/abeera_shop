import { PrismaService } from "../../prisma/prisma.service";
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<{
        id: string;
        variantId: string;
        productId: string;
        productName: string;
        productSlug: string;
        productImage: string;
        color: string;
        size: string;
        price: number;
        quantity: number;
        stock: number;
    }[]>;
    addItem(userId: string, variantId: string, quantity: number): Promise<{
        id: string;
        variantId: string;
        productId: string;
        productName: string;
        productSlug: string;
        productImage: string;
        color: string;
        size: string;
        price: number;
        quantity: number;
        stock: number;
    }[]>;
    updateQuantity(userId: string, itemId: string, quantity: number): Promise<{
        id: string;
        variantId: string;
        productId: string;
        productName: string;
        productSlug: string;
        productImage: string;
        color: string;
        size: string;
        price: number;
        quantity: number;
        stock: number;
    }[]>;
    removeItem(userId: string, itemId: string): Promise<{
        id: string;
        variantId: string;
        productId: string;
        productName: string;
        productSlug: string;
        productImage: string;
        color: string;
        size: string;
        price: number;
        quantity: number;
        stock: number;
    }[]>;
    clearCart(userId: string): Promise<never[]>;
}
