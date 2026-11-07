import { notFound, redirect } from "next/navigation";

import { PromoEditor } from "@/components/admin/promo-editor";
import { getAccessToken } from "@/lib/admin/auth";
import { type PromoCode } from "@/lib/admin/sales";
import { ApiError, apiClient } from "@/lib/api/client";

export default async function EditPromoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  let promo: PromoCode;
  try {
    promo = await apiClient.get<PromoCode>(`/admin/promos/${id}`, { token, cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return <PromoEditor key={promo.updatedAt} promo={promo} />;
}