import { categories, collections, products } from "@/lib/catalog/products";
import type {
  Category,
  CategorySlug,
  Product,
  ProductFilters,
  SortKey,
} from "@/lib/catalog/types";

const PAGE_SIZE = 12;

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getCollections() {
  return collections;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getAllProductSlugs() {
  return products.map((product) => product.slug);
}

export function getAllCategorySlugs(): CategorySlug[] {
  return categories.map((category) => category.slug);
}

export function getPriceBounds(subset: Product[] = products) {
  const prices = subset.map((product) => product.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getCatalogFacets(category?: CategorySlug) {
  const subset = products.filter((product) => inCategory(product, category));
  const source = subset.length > 0 ? subset : products;
  return {
    ...getFilterOptions(source),
    ...getPriceBounds(source),
  };
}

export function getFilterOptions(subset: Product[] = products) {
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

export function listProducts(filters: ProductFilters = {}) {
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

  let list = products.filter((product) => inCategory(product, category));
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

export function getNewArrivals(limit = 8) {
  return products.filter((product) => product.isNew).slice(0, limit);
}

export function getBestSellers(limit = 8) {
  return products.filter((product) => product.isBestSeller).slice(0, limit);
}

export function getRelated(product: Product, limit = 4) {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        (candidate.category === product.category || candidate.isBestSeller),
    )
    .slice(0, limit);
}

export function searchSuggest(query: string, limit = 6) {
  if (!query.trim()) return [];
  return listProducts({ query, pageSize: limit, sort: "featured" }).items;
}

export const popularSearches = [
  "silk dress",
  "camel coat",
  "linen",
  "gold hoops",
  "wool trouser",
];
