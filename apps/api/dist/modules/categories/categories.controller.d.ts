import { CategoriesService } from "./categories.service";
export declare class CategoriesController {
    private categories;
    constructor(categories: CategoriesService);
    findAll(): Promise<any[]>;
    findBySlug(slug: string): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        image: string | null;
        sortOrder: number;
    }>;
}
