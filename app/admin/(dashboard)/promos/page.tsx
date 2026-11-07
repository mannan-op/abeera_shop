import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminHeader, Notice, primaryBtnClass } from "@/components/admin/admin-ui";
import { getAccessToken } from "@/lib/admin/auth";
import { type PromoCode } from "@/lib/admin/sales";
import { ApiError, apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";

function discountLabel(promo: PromoCode) {
  return promo.discountType === "PERCENT" ? `${promo.amount}%` : formatPrice(promo.amount);
}

function when(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export default async function AdminPromosPage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  let promos: PromoCode[] | null = null;
  let problem = "";
  try {
    promos = await apiClient.get<PromoCode[]>("/admin/promos", { token, cache: "no-store" });
  } catch (error) {
    problem = error instanceof ApiError ? error.message : "The API did not respond.";
  }

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Promo codes" }]}
        title="Promo codes"
        description="Codes are checked when the order is placed. ABEERA10 lives here now — 10% off, with no expiry until you add one."
        action={
          <div className="flex gap-2">
            <Link href="/admin/sales" className="rounded-lg border border-[#e4dccf] bg-white px-3.5 py-2 text-xs font-medium text-[#2b211c]">
              Sales
            </Link>
            <Link href="/admin/promos/new" className={primaryBtnClass}>
              New code
            </Link>
          </div>
        }
      />
      {!promos ? <p className="text-sm text-red-700">Could not load codes. {problem}</p> : null}
      {promos && promos.length === 0 ? <Notice>No codes yet.</Notice> : null}
      {promos && promos.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-[#e4dccf] bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#faf7f2] text-[10px] tracking-[0.14em] text-[#8a7b6e] uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Off</th>
                <th className="px-4 py-3 font-medium">Minimum</th>
                <th className="px-4 py-3 font-medium">Window</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id} className="border-t border-[#efe6d8]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/promos/${promo.id}`} className="font-mono font-medium text-[#2b211c] underline-offset-4 hover:underline">
                      {promo.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{discountLabel(promo)}</td>
                  <td className="px-4 py-3">{promo.minSubtotal ? formatPrice(promo.minSubtotal) : "None"}</td>
                  <td className="px-4 py-3 text-[#6f6155]">
                    {when(promo.startsAt)}
                    <span className="mx-1 text-[#c4b6a6]">→</span>
                    {when(promo.expiresAt)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {promo.usedCount}
                    {promo.usageLimit != null ? ` / ${promo.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">{promo.active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
