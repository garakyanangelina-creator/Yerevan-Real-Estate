import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getSessionFromRequest, createSessionToken, SESSION_COOKIE } from "./lib/session";

const intlMiddleware = createIntlMiddleware(routing);
const LOCALES = ["en", "ru", "hy"];
const REFRESH_THRESHOLD_MS = 2 * 60 * 60 * 1000; // refresh if < 2h remaining
const SESSION_MAX_AGE = 8 * 60 * 60; // 8h in seconds

// ── Simple in-process rate limiter (best-effort on serverless) ──────────────
// On Vercel each serverless instance is isolated, so this limits per-instance.
// For production-grade rate limiting, use Vercel's WAF or an upstash Redis rate limiter.
interface RateLimitRecord { count: number; windowStart: number }
const loginAttempts = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // max 10 login attempts per IP per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return false;
  }
  record.count += 1;
  if (record.count > RATE_LIMIT_MAX) return true;
  return false;
}

// Periodically prune old entries to avoid memory growth
function pruneRateLimits() {
  const now = Date.now();
  for (const [ip, rec] of loginAttempts) {
    if (now - rec.windowStart > RATE_LIMIT_WINDOW_MS) loginAttempts.delete(ip);
  }
}

async function maybeRefreshSession(session: Awaited<ReturnType<typeof getSessionFromRequest>>, response: NextResponse): Promise<NextResponse> {
  if (!session) return response;
  if (session.expiresAt - Date.now() < REFRESH_THRESHOLD_MS) {
    const newToken = await createSessionToken(session.userId, session.role);
    response.cookies.set(SESSION_COOKIE, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── API routes ─────────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Login endpoints — apply rate limiting
    if (
      pathname === "/api/auth/login" ||
      pathname === "/api/admin/login"
    ) {
      if (req.method === "POST") {
        pruneRateLimits();
        const ip = getClientIp(req);
        if (isRateLimited(ip)) {
          return NextResponse.json(
            { ok: false, error: "Too many login attempts. Please try again later." },
            {
              status: 429,
              headers: {
                "Retry-After": "900",
                "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
              },
            }
          );
        }
      }
      return NextResponse.next();
    }

    // Public logout and auth/me
    if (
      pathname === "/api/auth/logout" ||
      pathname === "/api/admin/logout" ||
      pathname === "/api/auth/me"
    ) {
      return NextResponse.next();
    }

    // Public endpoints — no auth needed
    if (
      pathname === "/api/contact" ||
      pathname === "/api/submit" ||
      pathname === "/api/submit/upload"
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
