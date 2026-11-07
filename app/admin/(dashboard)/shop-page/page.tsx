import type { ShopPageContent, SiteDocumentResponse } from "@abeera/shared";
import { redirect } from "next/navigation";

import { ShopPageForm } from "@/components/admin/shop-page-form";
import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

export default async function AdminShopPage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  let doc: SiteDocumentResponse<ShopPageContent> | null = null;
  let problem = "";
  try {
    doc = await apiClient.get<SiteDocumentResponse<ShopPageContent>>("/admin/shop-page", { token, cache: "no-store" });
  } catch (error) {
    problem = error instanceof ApiError ? error.message : "The API did not respond.";
  }
  if (!doc) return <p className="text-sm text-destructive">Could not load the shop page. {problem}</p>;
  return <ShopPageForm initial={doc} />;
}
