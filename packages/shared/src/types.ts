export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  JAZZCASH = "JAZZCASH",
  EASYPAISA = "EASYPAISA",
  COD = "COD",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export type UserDto = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
};

export type CategoryDto = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  sortOrder: number;
};

export type ProductImageDto = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
};

export type ProductVariantDto = {
  id: string;
  color: string;
  colorHex: string;
  size: string;
  priceInPaisa: number;
  compareAtPrice: number | null;
  stock: number;
  soldOut: boolean;
};

export type ProductDto = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details: string;
  materials: string;
  care: string;
  category: CategoryDto;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  createdAt: string;
};

export type ProductListItemDto = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: CategoryDto;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  compareAtPrice: number | null;
  primaryImage: string | null;
  soldOut: boolean;
};

export type AddressDto = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type OrderItemDto = {
  id: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  color: string;
  size: string;
  price: number;
  quantity: number;
};

export type OrderDto = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItemDto[];
  subtotal: number;
  shipping: number;
  shippingMethod: string;
  discount: number;
  tax: number;
  total: number;
  address: AddressDto;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId: string | null;
  };
  createdAt: string;
};

export type CartItemDto = {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  color: string;
  size: string;
  price: number;
  quantity: number;
  stock: number;
};

export type DashboardStatsDto = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: OrderDto[];
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
};
