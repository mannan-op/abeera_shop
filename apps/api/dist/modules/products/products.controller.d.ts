import { ProductsService } from "./products.service";
export declare class ProductsController {
    private products;
    constructor(products: ProductsService);
    findAll(category?: string, size?: string, minPrice?: number, maxPrice?: number, sort?: string, page?: number, pageSize?: number, search?: string): Promise<{
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
    getFilters(category?: string): Promise<{
        sizes: string[];
        min: number;
        max: number;
    }>;
    findBySlug(slug: string): Promise<{}>;
}
