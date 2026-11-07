import { notFound, redirect } from "next/navigation";

import { CampaignEditor } from "@/components/admin/campaign-editor";
import { getAccessToken } from "@/lib/admin/auth";
import { type SaleCampaign } from "@/lib/admin/sales";
import { loadSaleOptions } from "@/lib/admin/sale-options";
import { ApiError, apiClient } from "@/lib/api/client";

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  let campaign: SaleCampaign;
  try {
    campaign = await apiClient.get<SaleCampaign>(`/admin/sales/${id}`, { token, cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const options = await loadSaleOptions(token);
  return <CampaignEditor key={campaign.updatedAt} campaign={campaign} categories={options.categories} products={options.products} />;
}
