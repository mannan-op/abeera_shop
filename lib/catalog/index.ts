export type { Product, Category, Collection, CartItem, Order } from "@/lib/catalog/types";
export { products, categories, collections } from "@/lib/catalog/products";
export { IMG, unsplash } from "@/lib/catalog/images";
export {
  getProduct,
  getProductById,
  listProducts,
  getCategory,
  getCategories,
  getCollections,
  getNewArrivals,
  getBestSellers,
  getRelated,
  searchSuggest,
  getFilterOptions,
  getCatalogFacets,
  getPriceBounds,
  getAllProductSlugs,
  getAllCategorySlugs,
  popularSearches,
} from "@/lib/catalog/queries";
export {
  testimonials,
  reviews,
  faqs,
  demoOrders,
  demoAddress,
  shippingMethods,
} from "@/lib/catalog/content";
