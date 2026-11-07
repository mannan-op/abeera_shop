import { redirect } from "next/navigation";

import { ProductEditor } from "@/components/admin/product-editor";
import { getAccessToken } from "@/lib/admin/auth";
import { apiClient } from "@/lib/api/client";

export default async function NewProductPage() {
  const token = await getAccessToken();
  if (!token) redirect("/admin/login");
  const categories = await apiClient.get<{ id: string; name: string }[]>("/categories", { cache: "no-store" });

  return (
    <ProductEditor
      categories={categories}
      initial={{
        name: "",
        slug: "",
        tagline: "",
        description: "",
        details: "",
        materials: "",
        care: "",
        categoryId: categories[0]?.id ?? "",
        isNew: true,
        isBestSeller: false,
        images: [],
        variants: [
          { color: "Ivory", colorHex: "#efe6d6", size: "S", price: "", sale: "", stock: "0", soldOut: false },
          { color: "Ivory", colorHex: "#efe6d6", size: "M", price: "", sale: "", stock: "0", soldOut: false },
          { color: "Ivory", colorHex: "#efe6d6", size: "L", price: "", sale: "", stock: "0", soldOut: false },
        ],
      }}
    />
  );
}
