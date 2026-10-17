import { cookies } from "next/headers";

import { ACCESS_COOKIE, API_URL, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { ensureAccessToken, writeSessionCookies } from "@/lib/auth/session";

export async function verifyCredentials(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
    user: { role: string };
  };
  if (data.user.role !== "ADMIN") return null;
  return data;
}

export async function createSession(tokens: { accessToken: string; refreshToken: string }) {
  await writeSessionCookies(tokens);
}

export async function destroySession() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  return ensureAccessToken();
}

export async function isAuthenticated() {
  const token = await getAccessToken();
  return Boolean(token);
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
