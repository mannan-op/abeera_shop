"use client";

import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/lib/admin/actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  return (
    <form
      action={async () => {
        if (confirm("Are you sure you want to delete this product?")) {
          await deleteProductAction(productId);
        }
      }}
    >
      <Button variant="outline" size="sm" type="submit" className="text-destructive">
        Delete
      </Button>
    </form>
  );
}
