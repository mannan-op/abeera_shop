import type { Category, Product, ProductColor } from "@/lib/catalog/types";

type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  sortOrder: number;
};

type ApiVariant = {
  id: string;
  color: string;
  colorHex: string;
  size: string;
  priceInPaisa: number;
  compareAtPrice: number | null;
  stock: number;
  soldOut: boolean;
};

type ApiImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
};

export type ApiProductDetail = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details: string;
  materials: string;
  care: string;
  category: ApiCategory;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  variants: ApiVariant[];
  images: ApiImage[];
};

export type ApiProductListItem = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ApiCategory;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  compareAtPrice: number | null;
  primaryImage: string | null;
  soldOut: boolean;
};

function categorySlug(slug: string): string {
  return slug;
}

function colorsFromProduct(product: ApiProductDetail): ProductColor[] {
  const byColor = new Map<string, ProductColor>();
  const fallbackImages = product.images.map((img) => img.url);
  const pair: [string, string] = [
    fallbackImages[0] ?? "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900",
    fallbackImages[1] ?? fallbackImages[0] ?? "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900",
  ];

  for (const variant of product.variants) {
    if (!byColor.has(variant.color)) {
      byColor.set(variant.color, {
        name: variant.color,
        hex: variant.colorHex,
        images: pair,
      });
    }
  }

  if (byColor.size === 0) {
    byColor.set("Default", { name: "Default", hex: "#888888", images: pair });
  }

  return [...byColor.values()];
}

export function mapApiProduct(product: ApiProductDetail): Product {
  const prices = product.variants.map((v) => v.priceInPaisa);
  const compares = product.variants
    .map((v) => v.compareAtPrice)
    .filter((v): v is number => v != null);
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const soldOut =
    product.variants.length > 0 && product.variants.every((v) => v.soldOut || v.stock <= 0);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    details: product.details,
    materials: product.materials,
    care: product.care,
    category: categorySlug(product.category.slug),
    price: prices.length ? Math.min(...prices) : 0,
    compareAtPrice: compares.length ? Math.min(...compares) : undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    colors: colorsFromProduct(product),
    sizes: sizes.length ? sizes : ["S", "M", "L"],
    soldOut,
    variants: product.variants.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      price: v.priceInPaisa,
      stock: v.stock,
    })),
  };
}

export function mapApiListItem(item: ApiProductListItem): Product {
  const image =
    item.primaryImage ??
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900";

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    tagline: item.tagline,
    description: "",
    details: "",
    materials: "",
    care: "",
    category: categorySlug(item.category.slug),
    price: item.startingPrice,
    compareAtPrice: item.compareAtPrice ?? undefined,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isNew: item.isNew,
    isBestSeller: item.isBestSeller,
    colors: [
      {
        name: "Default",
        hex: "#888888",
        images: [image, image],
      },
    ],
    sizes: ["S", "M", "L", "XL"],
    soldOut: item.soldOut,
  };
}

export function mapApiCategory(category: ApiCategory): Category {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    image: category.image ?? "",
  };
}
