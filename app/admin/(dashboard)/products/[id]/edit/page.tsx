import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { getAccessToken } from "@/lib/admin/auth";
import { apiClient } from "@/lib/api/client";
import type { Product } from "@/lib/catalog/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) notFound();

  const list = await apiClient.get<{ items: { id: string; slug: string }[] }>(
    "/products?pageSize=100",
    { token, cache: "no-store" },
  );
  const match = list.items.find((item) => item.id === id);
  if (!match) notFound();

  const detail = await apiClient.get<{
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    details: string;
    materials: string;
    care: string;
    category: { slug: string };
    isNew: boolean;
    isBestSeller: boolean;
    variants: { priceInPaisa: number }[];
  }>(`/products/${match.slug}`, { token, cache: "no-store" });

  const product: Product = {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    tagline: detail.tagline,
    description: detail.description,
    details: detail.details,
    materials: detail.materials,
    care: detail.care,
    category: detail.category.slug === "accessories" ? "accessories" : "stitched-suits",
    price: detail.variants[0]?.priceInPaisa ?? 0,
    rating: 0,
    reviewCount: 0,
    isNew: detail.isNew,
    isBestSeller: detail.isBestSeller,
    colors: [{ name: "Default", hex: "#888", images: ["https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900", "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900"] }],
    sizes: ["S", "M", "L", "XL"],
  };

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Products
      </Link>
      <h1 className="font-serif text-3xl">Edit: {product.name}</h1>
      <div className="mt-8 max-w-2xl rounded-xl border border-border bg-[#faf7f2] p-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
