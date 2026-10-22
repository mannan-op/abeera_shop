import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ACCESS_COOKIE,
  ACCESS_HEADER,
  ACCESS_MAX_AGE,
  API_URL,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from "@/lib/auth/cookies";
import { accessTokenNeedsRefresh } from "@/lib/auth/jwt";
import { isComingSoon } from "@/lib/coming-soon";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isComingSoon() && !pathname.startsWith("/admin") && pathname !== "/coming-soon") {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    return NextResponse.rewrite(url);
  }
  const requestHeaders = new Headers(request.headers);
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let refreshed: { accessToken: string; refreshToken: string } | null = null;
  if (refreshToken && accessTokenNeedsRefresh(accessToken)) {
    refreshed = await refreshSession(refreshToken);
    if (refreshed) accessToken = refreshed.accessToken;
  }

  if (accessToken) requestHeaders.set(ACCESS_HEADER, accessToken);

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (refreshed) {
    const secure = process.env.NODE_ENV === "production";
    response.cookies.set(ACCESS_COOKIE, refreshed.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_MAX_AGE,
    });
    response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
  }
  return response;
}

async function refreshSession(refreshToken: string) {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (!data.accessToken || !data.refreshToken) return null;
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
