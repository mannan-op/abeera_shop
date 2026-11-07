"use server";

import {
  shopPageSchema,
  siteIssueMessage,
  siteSettingsSchema,
  type ShopPageContent,
  type SiteDocumentResponse,
  type SiteSettings,
} from "@abeera/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

export type DocSaveResult = { ok: true; updatedAt: string | null } | { ok: false; error: string };

export async function saveSiteSettingsAction(content: SiteSettings): Promise<DocSaveResult> {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  const parsed = siteSettingsSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: siteIssueMessage(parsed.error) };
  try {
    const res = await apiClient.put<SiteDocumentResponse<SiteSettings>>("/admin/site-settings", parsed.data, { token });
    revalidatePath("/", "layout");
    return { ok: true, updatedAt: res.updatedAt };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    return { ok: false, error: "Could not reach the API to save settings." };
  }
}

export async function saveShopPageAction(content: ShopPageContent): Promise<DocSaveResult> {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  const parsed = shopPageSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: siteIssueMessage(parsed.error) };
  try {
    const res = await apiClient.put<SiteDocumentResponse<ShopPageContent>>("/admin/shop-page", parsed.data, { token });
    revalidatePath("/shop");
    return { ok: true, updatedAt: res.updatedAt };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    return { ok: false, error: "Could not reach the API to save the shop page." };
  }
}
