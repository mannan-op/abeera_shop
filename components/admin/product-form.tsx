"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProductAction } from "@/lib/admin/actions";
import type { Product } from "@/lib/catalog/types";

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: { slug: string; name: string }[];
}) {
  const [error, formAction, pending] = useActionState(saveProductAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {product ? (
        <input type="hidden" name="id" value={product.id} />
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" defaultValue={product?.name} required />
        <Field label="Slug" name="slug" defaultValue={product?.slug} required />
      </div>

      <Field label="Tagline" name="tagline" defaultValue={product?.tagline} />

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description}
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Details" name="details" defaultValue={product?.details} />
        <Field label="Materials" name="materials" defaultValue={product?.materials} />
      </div>

      <Field label="Care" name="care" defaultValue={product?.care} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? "stitched-suits"}
            required
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="price">Price (PKR)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={product ? (product.price / 100).toFixed(2) : ""}
            required
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isNew"
            defaultChecked={product?.isNew}
            className="size-4 rounded border-input"
          />
          New Arrival
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isBestSeller"
            defaultChecked={product?.isBestSeller}
            className="size-4 rounded border-input"
          />
          Best Seller
        </label>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-1.5"
      />
    </div>
  );
}
