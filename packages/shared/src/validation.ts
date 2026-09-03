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
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
