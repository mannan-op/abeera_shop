import { apiClient } from "@/lib/api/client";

type CategoryRow = { id: string; name: string };
type ProductRow = { id: string; name: string; category: { name: string } };
type ProductPage = { items: ProductRow[]; page: number; totalPages: number };

export async function loadSaleOptions(token: string) {
  const categories = await apiClient.get<CategoryRow[]>("/categories", { token, cache: "no-store" });
  const products: { id: string; name: string; detail: string }[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const result = await apiClient.get<ProductPage>(`/products?pageSize=100&page=${page}`, {
      token,
      cache: "no-store",
    });
    for (const item of result.items) {
      products.push({ id: item.id, name: item.name, detail: item.category.name });
    }
    if (page >= result.totalPages) break;
  }
  return {
    categories: categories.map((category) => ({ id: category.id, name: category.name })),
    products,
  };
}
