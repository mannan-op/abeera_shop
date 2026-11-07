"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

type Result = { ok: true } | { ok: false; error: string };

async function run(fn: (token: string) => Promise<{ product?: { slug: string } } | unknown>, slug: string): Promise<Result> {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  try {
    await fn(token);
    revalidatePath("/admin/reviews");
    revalidatePath(`/product/${slug}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    return { ok: false, error: "Could not reach the API." };
  }
}

export async function setReviewStatusAction(id: string, status: "PENDING" | "PUBLISHED" | "HIDDEN", productSlug: string) {
  return run((t) => apiClient.patch(`/admin/reviews/${id}`, { status }, { token: t }), productSlug);
}

export async function deleteReviewAction(id: string, productSlug: string) {
  return run((t) => apiClient.delete(`/admin/reviews/${id}`, { token: t }), productSlug);
}
