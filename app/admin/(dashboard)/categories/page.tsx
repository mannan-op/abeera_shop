import { redirect } from "next/navigation";

import { CategoriesManager } from "@/components/admin/categories-manager";
import { getAccessToken } from "@/lib/admin/auth";
import type { AdminCategory } from "@/lib/admin/categories";
import { ApiError, apiClient } from "@/lib/api/client";

export default async function AdminCategoriesPage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  let categories: AdminCategory[] | null = null;
  let problem = "";
  try {
    categories = await apiClient.get<AdminCategory[]>("/admin/categories", { token, cache: "no-store" });
  } catch (error) {
    problem = error instanceof ApiError ? error.message : "The API did not respond.";
  }
  if (!categories) return <p className="text-sm text-destructive">Could not load categories. {problem}</p>;
  return <CategoriesManager initial={categories} />;
}
