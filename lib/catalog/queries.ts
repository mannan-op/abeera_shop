import { collections, products as memoryProducts } from "@/lib/catalog/products";
import type {
  Category,
  CategorySlug,
  Product,
  ProductFilters,
  SortKey,
} from "@/lib/catalog/types";
import { apiClient, ApiError } from "@/lib/api/client";
import {
  mapApiCategory,
  mapApiListItem,
  mapApiProduct,
  type ApiProductDetail,
  type ApiProductListItem,
} from "@/lib/api/mappers";

const PAGE_SIZE = 12;
const USE_API = process.env.NEXT_PUBLIC_USE_API !== "false";

type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  pageCount?: number;
};

async function apiAvailable() {
  if (!USE_API) return false;
  try {
    await apiClient.get("/health", { cache: "no-store" });
    return true;
  } catch {
    return false;
  }
}

function memoryCategories(): Category[] {
  return [
    {
      slug: "new-arrivals",
      name: "New Arrivals",
      description: "Fresh designs for the season.",
      image: "",
      editorial: "Just landed.",
    },
    {
      slug: "stitched-suits",
      name: "Stitched Suits",
      description: "Ready-to-wear suits for every occasion.",
      image: "",
      editorial: "Crafted & ready to wear.",
    },
    {
      slug: "accessories",
      name: "Accessories",
      description: "Jewellery, clutches, and finishing pieces.",
      image: "",
      editorial: "The details.",
    },
    {
      slug: "sale",
      name: "Sale",
      description: "Previous-season pieces at reduced prices.",
      image: "",
      editorial: "While it lasts.",
    },
  ];
}

export async function getCategories(): Promise<Category[]> {
  try {
    if (!(await apiAvailable())) return memoryCategories();
    const rows = await apiClient.get<
      { id: string; slug: string; name: string; description: string; image: string | null; sortOrder: number }[]
    >("/categories");
    const mapped = rows.map(mapApiCategory);
    const extras = memoryCategories().filter(
      (c) => c.slug === "new-arrivals" || c.slug === "sale",
    );
    return [...extras, ...mapped.filter((c) => c.slug !== "new-arrivals" && c.slug !== "sale")];
  } catch {
    return memoryCategories();
  }
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const all = await getCategories();
  return all.find((category) => category.slug === slug);
}

export function getCollections() {
  return collections;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    if (await apiAvailable()) {
      const product = await apiClient.get<ApiProductDetail>(`/products/${slug}`);
      return mapApiProduct(product);
    }
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) {
      // fall through to memory
    }
  }
  return memoryProducts.find((product) => product.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    if (await apiAvailable()) {
      const result = await apiClient.get<Paginated<ApiProductListItem>>(
        `/products?pageSize=100`,
      );
      const match = result.items.find((item) => item.id === id);
      if (match) {
        const full = await apiClient.get<ApiProductDetail>(`/products/${match.slug}`);
        return mapApiProduct(full);
      }
    }
  } catch {
    // fall through
  }
  return getProductByIdSync(id);
}

/** Sync lookup for client components (wishlist, etc.) */
export function getProductByIdSync(id: string): Product | undefined {
  return memoryProducts.find((product) => product.id === id);
}

export async function getAllProductSlugs() {
  try {
    if (await apiAvailable()) {
      const result = await apiClient.get<Paginated<ApiProductListItem>>(
        `/products?pageSize=100`,
      );
      return result.items.map((item) => item.slug);
    }
  } catch {
    // fall through
  }
  return memoryProducts.map((product) => product.slug);
}

export async function getAllCategorySlugs(): Promise<CategorySlug[]> {
  const cats = await getCategories();
  return cats.map((category) => category.slug);
}

export function getPriceBounds(subset: Product[] = memoryProducts) {
  const prices = subset.map((product) => product.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export async function getCatalogFacets(category?: CategorySlug) {
  try {
    if (await apiAvailable()) {
      const params = new URLSearchParams();
      if (category && category !== "new-arrivals" && category !== "sale") {
        params.set("category", category);
      }
      const filters = await apiClient.get<{ sizes: string[]; min: number; max: number }>(
        `/products/filters?${params.toString()}`,
      );
      return {
        colors: [] as { name: string; hex: string }[],
        sizes: filters.sizes,
        min: filters.min,
        max: filters.max,
      };
    }
  } catch {
    // fall through
  }

  const subset = memoryProducts.filter((product) => inCategory(product, category));
  const source = subset.length > 0 ? subset : memoryProducts;
  return {
    ...getFilterOptions(source),
    ...getPriceBounds(source),
  };
}

export function getFilterOptions(subset: Product[] = memoryProducts) {
  const colors = new Map<string, string>();
  const sizes = new Set<string>();
  for (const product of subset) {
    for (const color of product.colors) {
      colors.set(color.name, color.hex);
    }
    for (const size of product.sizes) {
      sizes.add(size);
    }
  }
  return {
    colors: [...colors.entries()].map(([name, hex]) => ({ name, hex })),
    sizes: [...sizes],
  };
}

function inCategory(product: Product, category?: CategorySlug) {
  if (!category) return true;
  if (category === "new-arrivals") return product.isNew;
  if (category === "sale") return Boolean(product.compareAtPrice);
  return product.category === category;
}

function matchesQuery(product: Product, query?: string) {
  if (!query?.trim()) return true;
  const haystack = [
    product.name,
    product.tagline,
    product.description,
    product.category,
    ...product.colors.map((color) => color.name),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function sortProducts(list: Product[], sort: SortKey = "featured") {
  const copy = [...list];
  switch (sort) {
    case "featured":
      return copy.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
    case "newest":
      return copy.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default: {
      const _exhaustive: never = sort;
      return _exhaustive;
    }
  }
}

function listProductsMemory(filters: ProductFilters = {}) {
  const {
    category,
    query,
    colors,
    sizes,
    availability = "all",
    minPrice,
    maxPrice,
    sort = "featured",
    page = 1,
    pageSize = PAGE_SIZE,
  } = filters;

  let list = memoryProducts.filter((product) => inCategory(product, category));
  list = list.filter((product) => matchesQuery(product, query));

  if (colors?.length) {
    list = list.filter((product) =>
      product.colors.some((color) => colors.includes(color.name)),
    );
  }
  if (sizes?.length) {
    list = list.filter((product) =>
      product.sizes.some((size) => sizes.includes(size)),
    );
  }
  if (availability === "in-stock") {
    list = list.filter((product) => !product.soldOut);
  }
  if (availability === "sale") {
    list = list.filter((product) => Boolean(product.compareAtPrice));
  }
  if (minPrice !== undefined) {
    list = list.filter((product) => product.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    list = list.filter((product) => product.price <= maxPrice);
  }

  const sorted = sortProducts(list, sort);
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listProducts(filters: ProductFilters = {}) {
  const {
    category,
    query,
    sizes,
    availability = "all",
    minPrice,
    maxPrice,
    sort = "featured",
    page = 1,
    pageSize = PAGE_SIZE,
  } = filters;

  try {
    if (await apiAvailable()) {
      const params = new URLSearchParams();
      if (category === "new-arrivals") {
        // API filters by category slug; fetch and filter client-side for virtual cats
      } else if (category === "sale") {
        // handled after fetch
      } else if (category) {
        params.set("category", category);
      }
      if (sizes?.[0]) params.set("size", sizes[0]);
      if (minPrice !== undefined) params.set("minPrice", String(minPrice));
      if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
      if (sort) params.set("sort", sort);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (query) params.set("search", query);

      const result = await apiClient.get<Paginated<ApiProductListItem>>(
        `/products?${params.toString()}`,
      );

      let items = result.items.map(mapApiListItem);
      if (category === "new-arrivals") {
        items = items.filter((p) => p.isNew);
      }
      if (category === "sale" || availability === "sale") {
        items = items.filter((p) => Boolean(p.compareAtPrice));
      }
      if (availability === "in-stock") {
        items = items.filter((p) => !p.soldOut);
      }

      return {
        items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        pageCount: result.totalPages ?? Math.max(1, Math.ceil(result.total / result.pageSize)),
      };
    }
  } catch {
    // fall through
  }

  return listProductsMemory(filters);
}

export async function getNewArrivals(limit = 8) {
  const result = await listProducts({ category: "new-arrivals", pageSize: limit });
  return result.items;
}

export async function getBestSellers(limit = 8) {
  try {
    if (await apiAvailable()) {
      const result = await apiClient.get<Paginated<ApiProductListItem>>(
        `/products?sort=featured&pageSize=${limit}`,
      );
      return result.items.map(mapApiListItem).filter((p) => p.isBestSeller).slice(0, limit);
    }
  } catch {
    // fall through
  }
  return memoryProducts.filter((product) => product.isBestSeller).slice(0, limit);
}

export async function getRelated(product: Product, limit = 4) {
  const result = await listProducts({
    category: product.category,
    pageSize: limit + 4,
  });
  return result.items.filter((candidate) => candidate.id !== product.id).slice(0, limit);
}

export async function searchSuggest(query: string, limit = 6) {
  if (!query.trim()) return [];
  const result = await listProducts({ query, pageSize: limit, sort: "featured" });
  return result.items;
}

export const popularSearches = [
  "stitched suit",
  "embroidered",
  "formal",
  "lawn",
  "dupatta",
];
