import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { products } from "@/lib/catalog/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

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
