"use server";

import { homepageContentSchema, homepageIssueMessage } from "@abeera/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, destroySession, getAccessToken, verifyCredentials } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

export type HomepageSaveState = {
  status: "idle" | "saved" | "error";
  message: string;
};

export async function loginAction(_prev: string | null, formData: FormData) {
  const email = String(formData.get("username") ?? formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return "Please enter both fields.";

  const tokens = await verifyCredentials(email, password);
  if (!tokens) return "Invalid credentials or not an admin account.";

  await createSession(tokens);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function deleteProductAction(productId: string) {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  await apiClient.delete(`/admin/products/${productId}`, { token });
  redirect("/admin/products");
}

export async function saveProductAction(_prev: string | null, formData: FormData) {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");

  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const tagline = (formData.get("tagline") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const details = (formData.get("details") as string) ?? "";
  const materials = (formData.get("materials") as string) ?? "";
  const care = (formData.get("care") as string) ?? "";
  const categorySlug = formData.get("category") as string;
  const price = Math.round(Number(formData.get("price")) * 100);
  const isNew = formData.get("isNew") === "on";
  const isBestSeller = formData.get("isBestSeller") === "on";

  if (!name || !slug || !categorySlug) return "Name, slug, and category are required.";

  const categories = await apiClient.get<{ id: string; slug: string }[]>("/categories", { token });
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return "Category not found on API.";

  if (id) {
    await apiClient.patch(
      `/admin/products/${id}`,
      {
        name,
        slug,
        tagline,
        description,
        details,
        materials,
        care,
        categoryId: category.id,
        isNew,
        isBestSeller,
      },
      { token },
    );
  } else {
    await apiClient.post(
      "/admin/products",
      {
        name,
        slug,
        tagline,
        description,
        details,
        materials,
        care,
        categoryId: category.id,
        isNew,
        isBestSeller,
        variants: [
          {
            color: "Default",
            colorHex: "#888888",
            size: "M",
            priceInPaisa: price,
            stock: 10,
          },
        ],
      },
      { token },
    );
  }

  redirect("/admin/products");
}

export async function getAdminStats() {
  const token = await getAccessToken();
  if (!token) {
    return { totalProducts: 0, totalOrders: 0, totalRevenue: 0, recentOrders: [] };
  }
  return apiClient.get<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: unknown[];
  }>("/admin/dashboard", { token, cache: "no-store" });
}

export async function saveHomepageAction(
  _prev: HomepageSaveState,
  formData: FormData,
): Promise<HomepageSaveState> {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");

  const raw = formData.get("document");
  if (typeof raw !== "string") {
    return { status: "error", message: "The homepage form was empty." };
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { status: "error", message: "The homepage form could not be read." };
  }

  const parsed = homepageContentSchema.safeParse(body);
  if (!parsed.success) {
    return { status: "error", message: homepageIssueMessage(parsed.error) };
  }

  try {
    await apiClient.put("/admin/homepage", parsed.data, { token });
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Could not reach the API to save the homepage." };
  }

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { status: "saved", message: "Saved. The storefront homepage uses this copy." };
}
