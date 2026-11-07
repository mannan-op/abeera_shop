import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  tagline: z.string().default(""),
  description: z.string().default(""),
  details: z.string().default(""),
  materials: z.string().default(""),
  care: z.string().default(""),
  categoryId: z.string().uuid(),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  variants: z
    .array(
      z.object({
        color: z.string(),
        colorHex: z.string(),
        size: z.string(),
        priceInPaisa: z.number().int().positive(),
        compareAtPrice: z.number().int().positive().nullable().default(null),
        stock: z.number().int().min(0).default(0),
      }),
    )
    .min(1, "At least one variant is required"),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(""),
  image: z.string().nullable().default(null),
  sortOrder: z.number().int().default(0),
});

export const addToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(["JAZZCASH", "EASYPAISA", "COD"]),
  shippingMethod: z.enum(["standard", "express"]),
  promoCode: z.string().trim().max(40).optional(),
  idempotencyKey: z.string().trim().min(8).max(80),
});

/** Guest checkout: no account. The order carries the customer's own contact details. */
export const guestOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Enter your name").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9 -]{9,18}$/, "Enter a valid phone number, e.g. 03001234567"),
  }),
  address: z.object({
    line1: z.string().trim().min(3, "Enter an address").max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(2, "Enter a city").max(80),
    region: z.string().trim().min(2, "Enter a province").max(80),
    postalCode: z.string().trim().max(20).default(""),
    country: z.literal("Pakistan").default("Pakistan"),
  }),
  items: z
    .array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Your bag is empty")
    .max(30),
  paymentMethod: z.enum(["JAZZCASH", "EASYPAISA", "COD"]),
  shippingMethod: z.enum(["standard", "express"]),
  promoCode: z.string().trim().max(40).optional(),
  idempotencyKey: z.string().trim().min(8).max(80),
});

/** Preview checkout totals. Prices are computed on the server from variant ids. */
export const orderQuoteSchema = z.object({
  items: z
    .array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Your bag is empty")
    .max(30),
  shippingMethod: z.enum(["standard", "express"]),
  promoCode: z.string().trim().max(40).optional(),
});

export const orderLookupSchema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(4).max(40),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
});

export const addressSchema = z.object({
  label: z.string().min(1),
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default("Pakistan"),
  phone: z.string().min(10),
});

export const productFilterSchema = z.object({
  category: z.string().optional(),
  size: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc", "rating"]).default("featured"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(24),
  search: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type GuestOrderInput = z.infer<typeof guestOrderSchema>;
export type OrderQuoteInput = z.infer<typeof orderQuoteSchema>;
export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
