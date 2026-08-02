import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getSessionFromRequest } from "./lib/session";

const intlMiddleware = createIntlMiddleware(routing);
const LOCALES = ["en", "ru", "hy"];

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
    // Users page: super_admin only
    if (local.startsWith("/admin/users") && session.role !== "super_admin") {
      return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
    }
  }

  // Employee pages
  if (local.startsWith("/employee/")) {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
    }
    // Admins/super-admins shouldn't use employee routes
    if (["super_admin", "admin"].includes(session.role)) {
      return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
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
