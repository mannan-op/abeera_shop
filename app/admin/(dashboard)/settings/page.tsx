import type { SiteDocumentResponse, SiteSettings } from "@abeera/shared";
import { redirect } from "next/navigation";

import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";

export default async function AdminSettingsPage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  let doc: SiteDocumentResponse<SiteSettings> | null = null;
  let problem = "";
  try {
    doc = await apiClient.get<SiteDocumentResponse<SiteSettings>>("/admin/site-settings", { token, cache: "no-store" });
  } catch (error) {
    problem = error instanceof ApiError ? error.message : "The API did not respond.";
  }
  if (!doc) return <p className="text-sm text-destructive">Could not load site settings. {problem}</p>;
  return <SiteSettingsForm initial={doc} whatsappEnv={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""} />;
}
