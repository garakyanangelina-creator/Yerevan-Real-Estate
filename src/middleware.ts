import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getSessionFromRequest, createSessionToken, SESSION_COOKIE } from "./lib/session";

const intlMiddleware = createIntlMiddleware(routing);
const LOCALES = ["en", "ru", "hy"];
const REFRESH_THRESHOLD_MS = 2 * 60 * 60 * 1000; // refresh if < 2h remaining
const SESSION_MAX_AGE = 8 * 60 * 60; // 8h in seconds

async function maybeRefreshSession(session: Awaited<ReturnType<typeof getSessionFromRequest>>, response: NextResponse): Promise<NextResponse> {
  if (!session) return response;
  if (session.expiresAt - Date.now() < REFRESH_THRESHOLD_MS) {
    const newToken = await createSessionToken(session.userId, session.role);
    response.cookies.set(SESSION_COOKIE, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
  }
  return response;
}

function getLocale(pathname: string): string {
  return LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? "en";
}

function stripLocale(pathname: string, locale: string): string {
  if (pathname === `/${locale}`) return "/";
  if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  return pathname;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── API routes ─────────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Public — no auth
    if (
      pathname === "/api/auth/login" ||
      pathname === "/api/auth/logout" ||
      pathname === "/api/admin/login" ||
      pathname === "/api/admin/logout"
    ) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/super-admin/")) {
      const session = await getSessionFromRequest(req);
      if (!session || session.role !== "super_admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/admin/")) {
      const session = await getSessionFromRequest(req);
      if (!session || !["super_admin", "admin"].includes(session.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/employee/")) {
      const session = await getSessionFromRequest(req);
      if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // ── Page routes ────────────────────────────────────────────────────────────
  const locale = getLocale(pathname);
  const local = stripLocale(pathname, locale);

  // Admin sub-pages (not the login page itself)
  if (local.startsWith("/admin/")) {
    const session = await getSessionFromRequest(req);
    if (!session || !["super_admin", "admin"].includes(session.role)) {
      return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
    }
    if (local.startsWith("/admin/users") && session.role !== "super_admin") {
      return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
    }
    return maybeRefreshSession(session, intlMiddleware(req));
  }

  // Employee pages
  if (local.startsWith("/employee/")) {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
    }
    if (["super_admin", "admin"].includes(session.role)) {
      return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
    }
    return maybeRefreshSession(session, intlMiddleware(req));
  }

  // Public page routes — refresh session cookie if the user is logged in and close to expiry
  // This ensures admins/employees stay logged in while browsing the public site
  const sessionForPublic = req.cookies.get(SESSION_COOKIE)?.value;
  if (sessionForPublic) {
    const session = await getSessionFromRequest(req);
    if (session) {
      return maybeRefreshSession(session, intlMiddleware(req));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Pages (exclude static files and Next.js internals)
    "/((?!_next|_vercel|.*\\.[^/]*$).*)",
    // API routes
    "/api/:path*",
  ],
};
