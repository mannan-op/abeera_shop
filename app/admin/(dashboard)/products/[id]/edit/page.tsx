import { notFound, redirect } from "next/navigation";

import { ProductEditor } from "@/components/admin/product-editor";
import { toEditorVariant, type ApiVariantLike } from "@/lib/admin/product-model";
import { getAccessToken } from "@/lib/admin/auth";
import { apiClient } from "@/lib/api/client";

type Detail = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details: string;
  materials: string;
  care: string;
  categoryId: string;
  isNew: boolean;
  isBestSeller: boolean;
  variants: ApiVariantLike[];
  images: { url: string; alt: string; sortOrder: number }[];
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");

  let detail: Detail;
  try {
    detail = await apiClient.get<Detail>(`/products/by-id/${id}`, { token, cache: "no-store" });
  } catch {
    notFound();
  }
  const categories = await apiClient.get<{ id: string; name: string }[]>("/categories", { cache: "no-store" });

  return (
    <ProductEditor
      key={detail.id}
      categories={categories}
      initial={{
        id: detail.id,
        name: detail.name,
        slug: detail.slug,
        tagline: detail.tagline,
        description: detail.description,
        details: detail.details,
        materials: detail.materials,
        care: detail.care,
        categoryId: detail.categoryId,
        isNew: detail.isNew,
        isBestSeller: detail.isBestSeller,
        images: [...detail.images].sort((a, b) => a.sortOrder - b.sortOrder).map((i) => ({ url: i.url, alt: i.alt })),
        variants: detail.variants.map(toEditorVariant),
      }}
    />
  );
}
