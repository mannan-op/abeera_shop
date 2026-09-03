import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async createAddress(userId: string, data: {
    label: string; name: string; line1: string; line2?: string;
    city: string; region: string; postalCode: string; country?: string; phone: string;
  }) {
    return this.prisma.address.create({
      data: { ...data, country: data.country ?? "Pakistan", userId },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException("Address not found");
    return this.prisma.address.delete({ where: { id: addressId } });
  }
}
