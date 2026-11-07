import { redirect } from "next/navigation";

import { CampaignEditor } from "@/components/admin/campaign-editor";
import { getAccessToken } from "@/lib/admin/auth";
import { loadSaleOptions } from "@/lib/admin/sale-options";

export default async function NewSalePage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  const options = await loadSaleOptions(token);
  return <CampaignEditor campaign={null} categories={options.categories} products={options.products} />;
}
