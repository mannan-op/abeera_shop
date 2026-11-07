import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminHeader, Notice } from "@/components/admin/admin-ui";
import { ReviewActions } from "@/components/admin/review-actions";
import { getAccessToken } from "@/lib/admin/auth";
import { ApiError, apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type Status = "PENDING" | "PUBLISHED" | "HIDDEN";
type ReviewRow = {
  id: string;
  rating: number;
  title: string;
  body: string;
  status: Status;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; slug: string; images: { url: string }[] };
};
type List = { items: ReviewRow[]; counts: Record<Status, number>; averagePublished: number | null };

const TABS: { key: Status | "ALL"; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "PUBLISHED", label: "Published" },
  { key: "HIDDEN", label: "Hidden" },
  { key: "ALL", label: "All" },
];
const BADGE: Record<Status, string> = {
  PENDING: "bg-[#fbf0d9] text-[#8a6418]",
  PUBLISHED: "bg-[#e5f0e0] text-[#3f6a33]",
  HIDDEN: "bg-[#efe6d8] text-[#6f6155]",
};
const date = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  const { status = "PENDING", q = "" } = await searchParams;
  const tab = (TABS.some((t) => t.key === status) ? status : "PENDING") as Status | "ALL";
  const query = new URLSearchParams({ ...(tab !== "ALL" ? { status: tab } : {}), ...(q ? { search: q } : {}) });
  let list: List | null = null;
  let problem = "";
  try {
    list = await apiClient.get<List>(`/admin/reviews?${query}`, { token, cache: "no-store" });
  } catch (error) {
    problem = error instanceof ApiError ? error.message : "The API did not respond.";
  }
  if (!list) return <p className="text-sm text-destructive">Could not load reviews. {problem}</p>;
  const total = list.counts.PENDING + list.counts.PUBLISHED + list.counts.HIDDEN;

  return (
    <div>
      <AdminHeader
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Sales" }, { label: "Reviews" }]}
        title="Reviews"
        description="New reviews wait here until you approve them. Only published reviews appear on product pages."
      />
      <div className="mb-5 grid max-w-3xl grid-cols-3 gap-3">
        {[
          ["Waiting for approval", String(list.counts.PENDING)],
          ["Average published rating", list.averagePublished ? `${list.averagePublished.toFixed(1)} ★` : "—"],
          ["Hidden", String(list.counts.HIDDEN)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[#e4dccf] bg-white px-4 py-3">
            <p className="font-serif text-2xl text-[#2b211c] tabular-nums">{value}</p>
            <p className="text-[10px] tracking-[0.12em] text-[#8a7b6e] uppercase">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[#e4dccf]">
        {TABS.map((t) => {
          const count = t.key === "ALL" ? total : list.counts[t.key];
          return (
            <Link key={t.key} href={`/admin/reviews?status=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={tab === t.key ? "page" : undefined} className={cn("-mb-px border-b-2 px-3 py-2.5 text-[13px]", tab === t.key ? "border-[#2b211c] text-[#2b211c]" : "border-transparent text-[#8a7b6e] hover:text-[#2b211c]")}>
              {t.label} ({count})
            </Link>
          );
        })}
        <form action="/admin/reviews" className="ml-auto pb-1.5">
          <input type="hidden" name="status" value={tab} />
          <input name="q" defaultValue={q} placeholder="Search reviews" aria-label="Search reviews" className="h-8 w-56 rounded-lg border border-[#e4dccf] bg-white px-3 text-[12px] outline-none focus:border-[#b08d57]" />
        </form>
      </div>

      {list.items.length === 0 ? (
        <Notice>
          {total === 0
            ? "No reviews yet. When a signed-in customer reviews a product it lands here as Pending."
            : tab === "PENDING"
              ? "Nothing waiting — you're all caught up."
              : "No reviews in this view."}
        </Notice>
      ) : (
        <ul className="space-y-3">
          {list.items.map((r) => (
            <li key={r.id} className="flex gap-4 rounded-xl border border-[#e4dccf] bg-white p-4">
              <Link href={`/product/${r.product.slug}`} target="_blank" className="block h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#efe6d8]">
                {r.product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.product.images[0].url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] tracking-[0.1em] text-[#b08d57]" aria-label={`${r.rating} out of 5 stars`}>
                    {"★".repeat(r.rating)}
                    <span className="text-[#ddd2c2]">{"★".repeat(5 - r.rating)}</span>
                  </span>
                  <p className="font-medium text-[#2b211c]">{r.title || "Untitled review"}</p>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px]", BADGE[r.status])}>{r.status.toLowerCase()}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[#4d4038]">{r.body}</p>
                <p className="mt-1.5 text-[11px] text-[#8a7b6e]">
                  {r.user.name} · {r.user.email} · on <Link href={`/admin/products/${r.product.id}/edit`} className="underline">{r.product.name}</Link> · {date(r.createdAt)}
                </p>
              </div>
              <ReviewActions id={r.id} status={r.status} slug={r.product.slug} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
