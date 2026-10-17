import { cookies, headers } from "next/headers";

import {
  ACCESS_COOKIE,
  ACCESS_HEADER,
  ACCESS_MAX_AGE,
  API_URL,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from "@/lib/auth/cookies";
import { accessTokenExpired } from "@/lib/auth/jwt";

export async function writeSessionCookies(tokens: { accessToken: string; refreshToken: string }) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function ensureAccessToken() {
  const headerStore = await headers();
  const forwarded = headerStore.get(ACCESS_HEADER);
  if (forwarded && !accessTokenExpired(forwarded)) return forwarded;

  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (access && !accessTokenExpired(access)) return access;
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
    cache: "no-store",
  });
  if (!res.ok) return access && !accessTokenExpired(access) ? access : null;

  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  try {
    await writeSessionCookies(data);
  } catch {
    // Server renders cannot always write cookies. Proxy refreshes those requests.
  }
  return data.accessToken;
}
