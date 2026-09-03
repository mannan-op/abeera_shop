import { CartService } from "./cart.service";
export declare class CartController {
    private cart;
    constructor(cart: CartService);
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
    addItem(userId: string, body: {
        variantId: string;
        quantity?: number;
    }): Promise<{
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
    updateQuantity(userId: string, id: string, body: {
        quantity: number;
    }): Promise<{
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
    removeItem(userId: string, id: string): Promise<{
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
