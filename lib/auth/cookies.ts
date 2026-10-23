export const ACCESS_COOKIE = "abeera_access_token";
export const REFRESH_COOKIE = "abeera_refresh_token";
export const ACCESS_HEADER = "x-abeera-access-token";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const ACCESS_MAX_AGE = 60 * 15;
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
