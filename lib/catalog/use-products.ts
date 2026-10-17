"use client";

import * as React from "react";

import { apiClient } from "@/lib/api/client";
import { mapApiProduct, type ApiProductDetail } from "@/lib/api/mappers";
import { getProductByIdSync } from "@/lib/catalog/queries";
import { isCatalogApiRequired } from "@/lib/catalog/source";
import type { Product } from "@/lib/catalog/types";

export function useCatalogProducts(ids: string[]) {
  const key = ids.join("\n");
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const current = key ? key.split("\n") : [];
    if (!isCatalogApiRequired()) {
      setProducts(
        current
          .map((id) => getProductByIdSync(id))
          .filter((product): product is Product => Boolean(product)),
      );
      return;
    }

    let cancelled = false;
    Promise.all(
      current.map(async (id) => {
        try {
          const detail = await apiClient.get<ApiProductDetail>(`/products/by-id/${id}`, {
            cache: "no-store",
          });
          return mapApiProduct(detail);
        } catch {
          return null;
        }
      }),
    ).then((rows) => {
      if (!cancelled) {
        setProducts(rows.filter((product): product is Product => Boolean(product)));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return products;
}
