import { redirect } from "next/navigation";

import { PromoEditor } from "@/components/admin/promo-editor";
import { getAccessToken } from "@/lib/admin/auth";

export default async function NewPromoPage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  return <PromoEditor promo={null} />;
}
