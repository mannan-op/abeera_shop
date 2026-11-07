"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  sortOrder: number;
  showInShop: boolean;
  productCount: number;
};

export type CategoryInput = Partial<Pick<AdminCategory, "name" | "slug" | "description" | "image" | "showInShop">>;
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: (token: string) => Promise<T>): Promise<Result<T>> {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  try {
    const data = await fn(token);
    revalidatePath("/shop");
    revalidatePath("/category/[slug]", "page");
    revalidatePath("/admin/categories");
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    return { ok: false, error: "Could not reach the API." };
  }
}

export async function listCategoriesAction() {
  return run((t) => apiClient.get<AdminCategory[]>("/admin/categories", { token: t, cache: "no-store" }));
}

export async function createCategoryAction(input: CategoryInput) {
  return run((t) => apiClient.post<AdminCategory>("/admin/categories", input, { token: t }));
}

export async function updateCategoryAction(id: string, input: CategoryInput) {
  return run((t) => apiClient.patch<AdminCategory>(`/admin/categories/${id}`, input, { token: t }));
}

export async function reorderCategoriesAction(ids: string[]) {
  return run((t) => apiClient.put<AdminCategory[]>("/admin/categories/order", { ids }, { token: t }));
}

export async function deleteCategoryAction(id: string) {
  return run((t) => apiClient.delete<void>(`/admin/categories/${id}`, { token: t }));
}
