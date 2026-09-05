import { getAdminStats } from "@/lib/admin/actions";
import { formatPrice } from "@/lib/utils";
import { BoxIcon, DollarSignIcon, ShoppingCartIcon } from "lucide-react";

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: unknown[];
};

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const recentOrders = (stats.recentOrders ?? []) as RecentOrder[];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your store</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={BoxIcon} label="Total Products" value={String(stats.totalProducts)} />
        <StatCard icon={ShoppingCartIcon} label="Total Orders" value={String(stats.totalOrders)} />
        <StatCard
          icon={DollarSignIcon}
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
        />
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-xl">Recent Orders</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-[#faf7f2]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                      {order.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">{order.items?.length ?? 0}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(order.total)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-[#faf7f2] p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
