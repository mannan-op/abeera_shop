export const CATEGORY_SLUGS = [
  "new-arrivals",
  "stitched-suits",
  "accessories",
  "sale",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type ProductColor = {
  name: string;
  hex: string;
  images: [string, string, ...string[]];
};

export type ProductVariantRef = {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details: string;
  materials: string;
  care: string;
  category: Exclude<CategorySlug, "new-arrivals" | "sale">;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  colors: ProductColor[];
  sizes: string[];
  soldOut?: boolean;
  variants?: ProductVariantRef[];
};

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
  editorial?: string;
};

export type Collection = {
  slug: string;
  name: string;
  description: string;
  image: string;
  href: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export type CartItem = {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
};

export type SavedItem = CartItem;

export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type OrderStatus = "processing" | "shipped" | "delivered";

export type Order = {
  id: string;
  number: string;
  placedAt: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  address: Address;
  estimatedDelivery: string;
};

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export type ProductFilters = {
  category?: CategorySlug;
  query?: string;
  colors?: string[];
  sizes?: string[];
  availability?: "all" | "in-stock" | "sale";
  minPrice?: number;
  maxPrice?: number;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
};
