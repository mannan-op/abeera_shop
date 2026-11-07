import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminHeader, Notice } from "@/components/admin/admin-ui";
import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";
import { cn, formatPrice } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
  city: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
};
type List = { items: Row[]; total: number; page: number; totalPages: number; sort: string };
type Detail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  averageOrder: number;
  addresses: { id: string; label: string; name: string; line1: string; line2: string | null; city: string; region: string; postalCode: string; country: string; phone: string }[];
  orders: { id: string; orderNumber: string; status: string; total: number; createdAt: string; itemCount: number; payment: { method: string; status: string } | null }[];
};

const SORTS = [
  { value: "recent", label: "Newest customers" },
  { value: "spend", label: "Most spent" },
  { value: "orders", label: "Most orders" },
  { value: "last-order", label: "Latest order" },
  { value: "name", label: "Name A–Z" },
];

const STATUS: Record<string, string> = {
  PENDING: "bg-[#fbf0d9] text-[#8a6418]",
  CONFIRMED: "bg-[#e6eef7] text-[#2f5683]",
  SHIPPED: "bg-[#e6eef7] text-[#2f5683]",
  DELIVERED: "bg-[#e5f0e0] text-[#3f6a33]",
  CANCELLED: "bg-[#f7e3e1] text-[#8f3a31]",
};
const PAYMENT: Record<string, string> = { COD: "Cash on delivery", JAZZCASH: "JazzCash", EASYPAISA: "Easypaisa" };

const date = (iso: string | null) => (iso ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : "—");
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; id?: string; page?: string }> }) {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  const { q = "", sort = "recent", id, page = "1" } = await searchParams;
  const query = new URLSearchParams({ search: q, sort, page, pageSize: "25" });
  let list: List | null = null;
  let detail: Detail | null = null;
  let problem = "";
  try {
    list = await apiClient.get<List>(`/admin/customers?${query}`, { token, cache: "no-store" });
    const selected = id ?? list.items[0]?.id;
    if (selected) detail = await apiClient.get<Detail>(`/admin/customers/${encodeURIComponent(selected)}`, { token, cache: "no-store" });
  } catch (error) {
    problem = error instanceof ApiError ? error.message : "The API did not respond.";
  }
  if (!list) return <p className="text-sm text-destructive">Could not load customers. {problem}</p>;

  const href = (extra: Record<string, string>) => `/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), sort, ...extra })}`;

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Sales" }, { label: "Customers" }]}
        title="Customers"
        description="Everyone with an account, their orders and saved addresses. Read-only — customers manage their own details."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-4">
          <form className="flex flex-wrap items-center gap-2" action="/admin/customers">
            <input name="q" defaultValue={q} placeholder="Search name, email, phone or city" aria-label="Search customers" className="h-9 max-w-sm flex-1 rounded-lg border border-[#e4dccf] bg-white px-3 text-sm outline-none focus:border-[#b08d57]" />
            <select name="sort" defaultValue={sort} aria-label="Sort customers" className="h-9 rounded-lg border border-[#e4dccf] bg-white px-3 text-sm">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button type="submit" className="h-9 rounded-lg bg-[#2b211c] px-4 text-xs font-medium text-white">
              Apply
            </button>
            {q ? (
              <Link href={href({})} className="text-xs text-[#8a7b6e] underline">
                Clear search
              </Link>
            ) : null}
            <span className="ml-auto text-[11px] text-[#8a7b6e]">
              {list.total} {list.total === 1 ? "customer" : "customers"}
            </span>
          </form>

          {list.items.length === 0 ? (
            <Notice>{q ? `No customers match “${q}”.` : "No customer accounts yet."}</Notice>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#e4dccf] bg-white">
              <table className="w-full text-[13px]">
                <thead className="bg-[#faf7f2] text-left text-[10px] tracking-[0.12em] text-[#8a7b6e] uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Customer</th>
                    <th className="px-2 py-2.5 font-medium">City</th>
                    <th className="px-2 py-2.5 text-right font-medium">Orders</th>
                    <th className="px-2 py-2.5 text-right font-medium">Spent</th>
                    <th className="px-4 py-2.5 text-right font-medium">Last order</th>
                  </tr>
                </thead>
                <tbody>
                  {list.items.map((c) => {
                    const active = detail?.id === c.id;
                    return (
                      <tr key={c.id} className={cn("border-t border-[#efe6d8]", active && "bg-[#fbf7f0]")}>
                        <td className="px-4 py-2.5">
                          <Link href={href({ id: c.id, page })} className="flex items-center gap-3" aria-current={active ? "true" : undefined}>
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#efe6d8] text-[11px] font-medium text-[#6f6155]">{initials(c.name)}</span>
                            <span className="min-w-0">
                              <span className="block font-medium text-[#2b211c]">
                                {c.name}
                                {c.role === "ADMIN" ? <span className="ml-2 rounded bg-[#2b211c] px-1.5 py-0.5 text-[9px] tracking-[0.1em] text-white uppercase">Admin</span> : null}
                              </span>
                              <span className="block truncate text-[11px] text-[#8a7b6e]">{c.email}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-2 py-2.5 text-[#6f6155]">{c.city ?? "—"}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{c.orderCount}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{formatPrice(c.totalSpent)}</td>
                        <td className="px-4 py-2.5 text-right text-[#6f6155]">{date(c.lastOrderAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {list.totalPages > 1 ? (
            <div className="flex items-center justify-between text-[12px] text-[#8a7b6e]">
              <span>
                Page {list.page} of {list.totalPages}
              </span>
              <span className="flex gap-2">
                {list.page > 1 ? <Link className="underline" href={href({ page: String(list.page - 1) })}>Previous</Link> : null}
                {list.page < list.totalPages ? <Link className="underline" href={href({ page: String(list.page + 1) })}>Next</Link> : null}
              </span>
            </div>
          ) : null}
        </div>

        {detail ? (
          <aside className="space-y-4 self-start rounded-xl border border-[#e4dccf] bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#efe6d8] font-serif text-lg text-[#6f6155]">{initials(detail.name)}</span>
              <div className="min-w-0">
                <p className="font-serif text-xl text-[#2b211c]">{detail.name}</p>
                <p className="truncate text-[12px] text-[#8a7b6e]">
                  {detail.email}
                  {detail.phone ? ` · ${detail.phone}` : ""}
                </p>
                <p className="text-[11px] text-[#8a7b6e]">First order {date(detail.createdAt)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Orders", String(detail.orderCount)],
                ["Total spent", formatPrice(detail.totalSpent)],
                ["Average order", formatPrice(detail.averageOrder)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-[#faf7f2] px-3 py-2.5">
                  <p className="font-serif text-lg text-[#2b211c] tabular-nums">{value}</p>
                  <p className="text-[10px] tracking-[0.12em] text-[#8a7b6e] uppercase">{label}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium text-[#2b211c]">Orders</p>
              {detail.orders.length === 0 ? (
                <p className="text-[12px] text-[#8a7b6e]">No orders yet.</p>
              ) : (
                <ul className="divide-y divide-[#efe6d8] rounded-lg border border-[#efe6d8]">
                  {detail.orders.map((o) => (
                    <li key={o.id}>
                      <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-3 py-2 text-[12px] hover:bg-[#faf7f2]">
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-[#2b211c]">{o.orderNumber}</span>
                          <span className="block text-[11px] text-[#8a7b6e]">
                            {date(o.createdAt)} · {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                            {o.payment ? ` · ${PAYMENT[o.payment.method] ?? o.payment.method}` : ""}
                          </span>
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px]", STATUS[o.status] ?? "bg-[#efe6d8]")}>{o.status.toLowerCase()}</span>
                        <span className="w-20 text-right tabular-nums">{formatPrice(o.total)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium text-[#2b211c]">Addresses</p>
              {detail.addresses.length === 0 ? (
                <p className="text-[12px] text-[#8a7b6e]">No saved addresses.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {detail.addresses.map((a) => (
                    <div key={a.id} className="rounded-lg border border-[#efe6d8] p-3 text-[12px] leading-relaxed text-[#6f6155]">
                      <span className="mb-1 inline-block rounded bg-[#faf7f2] px-1.5 py-0.5 text-[10px] tracking-[0.1em] uppercase">{a.label}</span>
                      <p className="font-medium text-[#2b211c]">{a.name}</p>
                      <p>
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}
                      </p>
                      <p>
                        {a.city}, {a.region} {a.postalCode}
                      </p>
                      <p>{a.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
