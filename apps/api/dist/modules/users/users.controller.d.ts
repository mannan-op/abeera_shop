import { UsersService } from "./users.service";
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    getAddresses(userId: string): Promise<{
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
    }[]>;
    createAddress(userId: string, body: {
        label: string;
        name: string;
        line1: string;
        line2?: string;
        city: string;
        region: string;
        postalCode: string;
        phone: string;
    }): Promise<{
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
    }>;
    deleteAddress(userId: string, id: string): Promise<{
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
    }>;
}
