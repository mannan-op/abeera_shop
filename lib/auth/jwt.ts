export function jwtExpiryMs(token: string): number | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function accessTokenExpired(token: string | undefined, skewMs = 5_000) {
  if (!token) return true;
  const exp = jwtExpiryMs(token);
  if (exp == null) return true;
  return exp <= Date.now() + skewMs;
}

/** Refresh while the access token is still valid, so the next request is not logged out. */
export function accessTokenNeedsRefresh(token: string | undefined, windowMs = 120_000) {
  if (!token) return true;
  const exp = jwtExpiryMs(token);
  if (exp == null) return true;
  return exp <= Date.now() + windowMs;
}
