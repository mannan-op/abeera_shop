import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Products
      </Link>
      <h1 className="font-serif text-3xl">New Product</h1>
      <div className="mt-8 max-w-2xl rounded-xl border border-border bg-[#faf7f2] p-6">
        <ProductForm />
      </div>
    </div>
  );
}
