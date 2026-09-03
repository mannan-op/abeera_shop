"use server";

import { redirect } from "next/navigation";

import { createSession, destroySession, verifyCredentials } from "@/lib/admin/auth";
import { products } from "@/lib/catalog/products";
import { demoOrders } from "@/lib/catalog/content";
import type { Product } from "@/lib/catalog/types";

export async function loginAction(_prev: string | null, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) return "Please enter both fields.";

  const valid = await verifyCredentials(username, password);
  if (!valid) return "Invalid username or password.";

  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function deleteProductAction(productId: string) {
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) products.splice(index, 1);
  redirect("/admin/products");
}

export async function saveProductAction(_prev: string | null, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const tagline = formData.get("tagline") as string;
  const description = formData.get("description") as string;
  const details = formData.get("details") as string;
  const materials = formData.get("materials") as string;
  const care = formData.get("care") as string;
  const category = formData.get("category") as Product["category"];
  const price = Math.round(Number(formData.get("price")) * 100);
  const isNew = formData.get("isNew") === "on";
  const isBestSeller = formData.get("isBestSeller") === "on";

  if (!name || !slug || !category) return "Name, slug, and category are required.";

  const existing = products.find((p) => p.id === id);

  if (existing) {
    Object.assign(existing, {
      name,
      slug,
      tagline,
      description,
      details,
      materials,
      care,
      category,
      price,
      isNew,
      isBestSeller,
    });
  } else {
    products.push({
      id: `p-${Date.now()}`,
      slug,
      name,
      tagline,
      description,
      details,
      materials,
      care,
      category,
      price,
      rating: 0,
      reviewCount: 0,
      isNew,
      isBestSeller,
      colors: [{ name: "Default", hex: "#888888", images: ["/placeholder.svg", "/placeholder.svg"] }],
      sizes: ["XS", "S", "M", "L", "XL"],
    });
  }

  redirect("/admin/products");
}

export async function getAdminStats() {
  const totalProducts = products.length;
  const totalOrders = demoOrders.length;
  const totalRevenue = demoOrders.reduce((sum, order) => sum + order.total, 0);
  return { totalProducts, totalOrders, totalRevenue };
}
