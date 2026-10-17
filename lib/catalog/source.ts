/** Production always reads the catalog from Postgres. Memory data is local UI only. */
export function isCatalogApiRequired() {
  return process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_USE_API !== "false";
}
