"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

export type DiscountKind = "PERCENT" | "FIXED";
export type CampaignScope = "ALL" | "CATEGORIES" | "PRODUCTS";
export type CampaignStatus = "live" | "scheduled" | "ended" | "paused";

export type SaleCampaign = {
  id: string;
  name: string;
  discountType: DiscountKind;
  amount: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  scope: CampaignScope;
  categoryIds: string[];
  productIds: string[];
  bannerText: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
};

export type PromoCode = {
  id: string;
  code: string;
  discountType: DiscountKind;
  amount: number;
  minSubtotal: number;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampaignInput = {
  name: string;
  discountType: DiscountKind;
  amount: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  scope: CampaignScope;
  categoryIds: string[];
  productIds: string[];
  bannerText: string;
};

export type PromoInput = {
  code: string;
  discountType: DiscountKind;
  amount: number;
  minSubtotal: number;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  active: boolean;
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: (token: string) => Promise<T>, paths: string[]): Promise<Result<T>> {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  try {
    const data = await fn(token);
    for (const path of paths) revalidatePath(path);
    revalidatePath("/shop");
    revalidatePath("/category/sale");
    revalidatePath("/");
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    return { ok: false, error: "Could not reach the API." };
  }
}

export async function saveCampaignAction(id: string | undefined, input: CampaignInput) {
  return run(
    (token) =>
      id
        ? apiClient.patch<SaleCampaign>(`/admin/sales/${id}`, input, { token })
        : apiClient.post<SaleCampaign>("/admin/sales", input, { token }),
    ["/admin/sales"],
  );
}

export async function endCampaignAction(id: string) {
  return run((token) => apiClient.post<SaleCampaign>(`/admin/sales/${id}/end`, {}, { token }), ["/admin/sales"]);
}

export async function deleteCampaignAction(id: string): Promise<void> {
  const result = await run(async (token) => {
    await apiClient.delete(`/admin/sales/${id}`, { token });
    return true;
  }, ["/admin/sales"]);
  if (result.ok) redirect("/admin/sales");
}

export async function savePromoAction(id: string | undefined, input: PromoInput) {
  return run(
    (token) =>
      id
        ? apiClient.patch<PromoCode>(`/admin/promos/${id}`, input, { token })
        : apiClient.post<PromoCode>("/admin/promos", input, { token }),
    ["/admin/promos"],
  );
}

export async function deletePromoAction(id: string): Promise<void> {
  const result = await run(async (token) => {
    await apiClient.delete(`/admin/promos/${id}`, { token });
    return true;
  }, ["/admin/promos"]);
  if (result.ok) redirect("/admin/promos");
}
