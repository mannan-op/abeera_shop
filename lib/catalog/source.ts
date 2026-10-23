/**
 * The catalog comes from Postgres through the API when an API URL is set,
 * or when the app explicitly opts in with NEXT_PUBLIC_USE_API=true.
 * A Next-only preview (Vercel, no Nest, no Postgres) has neither, so it
 * may render the in-repo sample catalog — and must say so. Sample data
 * is never a fallback once an API URL is configured.
 */
export function isCatalogApiRequired() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl) return true;
  return process.env.NEXT_PUBLIC_USE_API === "true";
}

/** Production deploy with no catalog API: sample products, with a visible warning. */
export function isSampleCatalogPreview() {
  return process.env.NODE_ENV === "production" && !isCatalogApiRequired();
}
