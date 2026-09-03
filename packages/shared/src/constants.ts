export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const CURRENCY = "PKR";
export const LOCALE = "en-PK";

export const FREE_SHIPPING_THRESHOLD = 500000; // 5000 PKR in paisa
export const STANDARD_SHIPPING = 30000; // 300 PKR
export const EXPRESS_SHIPPING = 50000; // 500 PKR

export const JWT_ACCESS_EXPIRY = "15m";
export const JWT_REFRESH_EXPIRY = "7d";

export const CACHE_TTL = {
  PRODUCT_LIST: 300, // 5 min
  PRODUCT_DETAIL: 600, // 10 min
  CATEGORIES: 3600, // 1 hour
  GUEST_CART: 604800, // 7 days
} as const;

export const RATE_LIMIT = {
  PUBLIC: { ttl: 60, limit: 100 },
  AUTH: { ttl: 60, limit: 30 },
  ADMIN: { ttl: 60, limit: 200 },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 24,
  MAX_PAGE_SIZE: 100,
} as const;
