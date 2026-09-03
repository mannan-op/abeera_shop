import { PrismaService } from "../../prisma/prisma.service";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    findAddresses(userId: string): Promise<{
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
    createAddress(userId: string, data: {
        label: string;
        name: string;
        line1: string;
        line2?: string;
        city: string;
        region: string;
        postalCode: string;
        country?: string;
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
    deleteAddress(userId: string, addressId: string): Promise<{
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
