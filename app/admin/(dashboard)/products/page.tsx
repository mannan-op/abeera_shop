import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/admin/auth";
import { apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";

type ApiListItem = {
  id: string;
  slug: string;
  name: string;
  category: { name: string; slug: string };
  startingPrice: number;
  compareAtPrice: number | null;
  isNew: boolean;
  soldOut: boolean;
};

export default async function AdminProductsPage() {
  const token = await getAccessToken();
  let items: ApiListItem[] = [];
  if (token) {
    try {
      const result = await apiClient.get<{ items: ApiListItem[] }>(
        "/products?pageSize=100",
        { token, cache: "no-store" },
      );
      items = result.items;
    } catch {
      items = [];
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusIcon className="mr-2 size-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-[#faf7f2]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.slug}</p>
                </td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3 text-right">
                  {formatPrice(product.startingPrice)}
                  {product.compareAtPrice ? (
                    <span className="ml-1 text-xs text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {product.isNew ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        New
                      </span>
                    ) : null}
                    {product.soldOut ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        Sold Out
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
