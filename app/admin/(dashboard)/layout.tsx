import { AdminSidebar } from "@/components/admin/sidebar";
import { getAccessToken } from "@/lib/admin/auth";
import { apiClient } from "@/lib/api/client";

async function pendingReviewCount() {
  const token = await getAccessToken();
  if (!token) return 0;
  try {
    const res = await apiClient.get<{ counts: { PENDING: number } }>("/admin/reviews?status=PENDING&search=__count_only__", {
      token,
      cache: "no-store",
    });
    return res.counts.PENDING;
  } catch {
    return 0;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pending = await pendingReviewCount();
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar pendingReviews={pending} />
      <main className="min-w-0 flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
