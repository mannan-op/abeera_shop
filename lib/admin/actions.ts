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

export type ProductSaveState = {
  status: "idle" | "saved" | "error";
  message: string;
};

export async function saveProductAction(
  _prev: ProductSaveState,
  formData: FormData,
): Promise<ProductSaveState> {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");

  let body: { id?: string; slug?: string } & Record<string, unknown>;
  try {
    body = JSON.parse(String(formData.get("document") ?? ""));
  } catch {
    return { status: "error", message: "The product form could not be read." };
  }
  const { id, ...payload } = body;

  let saved: { id: string; slug: string };
  try {
    saved = id
      ? await apiClient.patch<{ id: string; slug: string }>(`/admin/products/${id}`, payload, { token })
      : await apiClient.post<{ id: string; slug: string }>("/admin/products", payload, { token });
  } catch (error) {
    if (error instanceof ApiError) return { status: "error", message: error.message };
    return { status: "error", message: "Could not reach the API to save the product." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${saved.slug}`);
  if (!id) redirect(`/admin/products/${saved.id}/edit?created=1`);
  return { status: "saved", message: "Saved. The shop shows these details now." };
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
