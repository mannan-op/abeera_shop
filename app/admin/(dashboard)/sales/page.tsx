import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminHeader, Notice, primaryBtnClass } from "@/components/admin/admin-ui";
import { getAccessToken } from "@/lib/admin/auth";
import { type SaleCampaign } from "@/lib/admin/sales";
import { ApiError, apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";

const STATUS: Record<SaleCampaign["status"], string> = {
  live: "Live",
  scheduled: "Scheduled",
  ended: "Ended",
  paused: "Paused",
};

function discountLabel(sale: SaleCampaign) {
  return sale.discountType === "PERCENT" ? `${sale.amount}% off` : `${formatPrice(sale.amount)} off`;
}

function scopeLabel(sale: SaleCampaign) {
  if (sale.scope === "ALL") return "All products";
  if (sale.scope === "CATEGORIES") return `${sale.categoryIds.length} categories`;
  return `${sale.productIds.length} products`;
}

function when(iso: string) {
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export default async function AdminSalesPage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  let sales: SaleCampaign[] | null = null;
  let problem = "";
  try {
    sales = await apiClient.get<SaleCampaign[]>("/admin/sales", { token, cache: "no-store" });
  } catch (error) {
    problem = error instanceof ApiError ? error.message : "The API did not respond.";
  }

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Sales" }]}
        title="Sales"
        description="Campaigns change the price on the product itself. They start and stop from the dates below, as long as Active is on."
        action={
          <div className="flex gap-2">
            <Link href="/admin/promos" className="rounded-lg border border-[#e4dccf] bg-white px-3.5 py-2 text-xs font-medium text-[#2b211c]">
              Promo codes
            </Link>
            <Link href="/admin/sales/new" className={primaryBtnClass}>
              New sale
            </Link>
          </div>
        }
      />
      {!sales ? <p className="text-sm text-red-700">Could not load sales. {problem}</p> : null}
      {sales && sales.length === 0 ? (
        <Notice>No sales yet. A new sale can cover the whole shop, a few categories, or specific products.</Notice>
      ) : null}
      {sales && sales.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-[#e4dccf] bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#faf7f2] text-[10px] tracking-[0.14em] text-[#8a7b6e] uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Window</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t border-[#efe6d8]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/sales/${sale.id}`} className="font-medium text-[#2b211c] underline-offset-4 hover:underline">
                      {sale.name}
                    </Link>
                    {sale.bannerText ? <p className="mt-0.5 max-w-xs truncate text-[11px] text-[#8a7b6e]">{sale.bannerText}</p> : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{discountLabel(sale)}</td>
                  <td className="px-4 py-3 text-[#6f6155]">
                    {when(sale.startsAt)}
                    <span className="mx-1 text-[#c4b6a6]">→</span>
                    {when(sale.endsAt)}
                  </td>
                  <td className="px-4 py-3">{scopeLabel(sale)}</td>
                  <td className="px-4 py-3">{STATUS[sale.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
