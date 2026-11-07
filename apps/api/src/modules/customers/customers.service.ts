import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

export type CustomerSort = "recent" | "spend" | "orders" | "name" | "last-order";
const SORTS: CustomerSort[] = ["recent", "spend", "orders", "name", "last-order"];

/** Read-only customer views for the admin. Cancelled orders don't count towards spend. */
@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  /** Customers are grouped by the email on their orders (checkout is guest-only). */
  private async grouped(search: string) {
    const q = search.trim();
    const where: Prisma.OrderWhereInput = q
      ? {
          OR: [
            { customerName: { contains: q, mode: "insensitive" } },
            { customerEmail: { contains: q, mode: "insensitive" } },
            { customerPhone: { contains: q } },
            { address: { city: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {};
    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        total: true,
        status: true,
        createdAt: true,
        address: { select: { city: true } },
      },
    });
    const byEmail = new Map<string, typeof orders>();
    for (const o of orders) {
      const key = o.customerEmail.toLowerCase();
      byEmail.set(key, [...(byEmail.get(key) ?? []), o]);
    }
    return [...byEmail.entries()].map(([email, list]) => {
      const latest = list[0];
      const counted = list.filter((o) => o.status !== "CANCELLED");
      return {
        id: email,
        name: latest.customerName,
        email,
        phone: latest.customerPhone,
        role: "CUSTOMER",
        city: latest.address.city,
        createdAt: list[list.length - 1].createdAt,
        orderCount: list.length,
        totalSpent: counted.reduce((n, o) => n + o.total, 0),
        lastOrderAt: latest.createdAt,
      };
    });
  }

  async list(search = "", sortParam = "recent", page = 1, pageSize = 25) {
    const sort: CustomerSort = SORTS.includes(sortParam as CustomerSort) ? (sortParam as CustomerSort) : "recent";
    const rows = await this.grouped(search);
    const time = (d: Date | null) => (d ? d.getTime() : 0);
    rows.sort((a, b) => {
      switch (sort) {
        case "spend":
          return b.totalSpent - a.totalSpent || time(b.lastOrderAt) - time(a.lastOrderAt);
        case "orders":
          return b.orderCount - a.orderCount || b.totalSpent - a.totalSpent;
        case "name":
          return a.name.localeCompare(b.name);
        case "last-order":
          return time(b.lastOrderAt) - time(a.lastOrderAt);
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
    const size = Math.min(Math.max(1, pageSize), 100);
    const current = Math.max(1, page);
    return {
      items: rows.slice((current - 1) * size, current * size),
      total: rows.length,
      page: current,
      pageSize: size,
      totalPages: Math.max(1, Math.ceil(rows.length / size)),
      sort,
    };
  }

  /** id is the customer's email. */
  async detail(id: string) {
    const email = id.trim().toLowerCase();
    const orders = await this.prisma.order.findMany({
      where: { customerEmail: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        customerName: true,
        customerPhone: true,
        address: true,
        payment: { select: { method: true, status: true } },
        _count: { select: { items: true } },
      },
    });
    if (!orders.length) throw new NotFoundException("Customer not found");
    const counted = orders.filter((o) => o.status !== "CANCELLED");
    const totalSpent = counted.reduce((n, o) => n + o.total, 0);
    const seen = new Set<string>();
    const addresses = orders
      .map((o) => o.address)
      .filter((a) => {
        const key = [a.line1, a.line2, a.city, a.region, a.postalCode].join("|").toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    return {
      id: email,
      name: orders[0].customerName,
      email,
      phone: orders[0].customerPhone,
      role: "CUSTOMER",
      createdAt: orders[orders.length - 1].createdAt,
      addresses,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
        payment: o.payment,
        itemCount: o._count.items,
      })),
      orderCount: orders.length,
      totalSpent,
      averageOrder: counted.length ? Math.round(totalSpent / counted.length) : 0,
    };
  }
}
