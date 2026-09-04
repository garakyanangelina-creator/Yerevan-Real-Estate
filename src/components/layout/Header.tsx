"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, Moon, Sun, Globe, LayoutDashboard, LogOut, ChevronDown, User } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { localeNames, locales } from "@/i18n/routing";
import { useDarkMode } from "@/hooks/useDarkMode";

interface AuthUser {
  id: string;
  username: string;
  role: "super_admin" | "admin" | "employee";
}

function dashboardHref(role: AuthUser["role"], locale: string): string {
  if (role === "employee") return `/${locale}/employee/dashboard`;
  return `/${locale}/admin/dashboard`;
}

function roleLabel(role: AuthUser["role"]): string {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Agent";
}

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined); // undefined = loading
  const accountRef = useRef<HTMLDivElement>(null);

  // Fetch current session on mount (and after login/logout via events)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setUser(d.user ?? null); })
      .catch(() => { if (!cancelled) setUser(null); });
    return () => { cancelled = true; };
  }, [pathname]); // re-check on navigation so dashboard link updates immediately

  // Close account dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function signOut() {
    setAccountOpen(false);
    // Try employee logout first, then admin logout
    const url = user?.role === "employee" ? "/api/auth/logout" : "/api/admin/logout";
    await fetch(url, { method: "POST" }).catch(() => {});
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("search") },
    { href: "/search?purpose=sale", label: t("buy") },
    { href: "/search?purpose=rent", label: t("rent") },
    { href: "/search?type=commercial", label: t("commercial") },
    { href: "/submit", label: t("submit") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 glass shadow-glass">
      <div className="container-page flex h-18 items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo-new.png" alt="Yerevan Real Estate" style={{ height: "64px", width: "auto" }} />
          <span className="hidden font-serif text-lg font-bold tracking-tight text-primary-800 dark:text-white sm:block">
            Yerevan Real Estate
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-700 transition-colors hover:text-gold-600 dark:text-white/80 dark:hover:text-gold-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              aria-label="Change language"
            >
              <Globe className="h-3.5 w-3.5" />
              {locale.toUpperCase()}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/10 dark:bg-primary-800">
                {locales.map((l) => (
                  <Link
                    key={l}
                    href={pathname}
                    locale={l}
                    onClick={() => setLangOpen(false)}
                    className="block px-4 py-2.5 text-sm text-primary-800 transition hover:bg-primary-50 dark:text-white dark:hover:bg-white/10"
                  >
                    {localeNames[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Dark mode */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-full border border-primary-200 p-2 text-primary-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Auth area (desktop) */}
          {user === undefined ? (
            // Loading — show placeholder so layout doesn't shift
            <div className="hidden h-8 w-24 animate-pulse rounded-full bg-primary-100 dark:bg-white/10 lg:block" />
          ) : user ? (
            // Logged-in: account dropdown
            <div ref={accountRef} className="relative hidden lg:block">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-700 transition hover:border-gold-400 hover:text-gold-600 dark:border-white/20 dark:text-white/80 dark:hover:border-gold-400 dark:hover:text-gold-400"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{user.username}</span>
                <span className="rounded-full bg-gold-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gold-700 dark:bg-gold-900/30 dark:text-gold-400">
                  {roleLabel(user.role)}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/10 dark:bg-primary-800">
                  <div className="border-b border-primary-100 px-4 py-3 dark:border-white/10">
                    <p className="text-xs font-semibold text-primary-400 dark:text-white/40 uppercase tracking-wide">Signed in as</p>
                    <p className="mt-0.5 font-semibold text-primary-900 dark:text-white">{user.username}</p>
                  </div>
                  <a
                    href={dashboardHref(user.role, locale)}
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-primary-800 transition hover:bg-primary-50 dark:text-white dark:hover:bg-white/10"
                  >
                    <LayoutDashboard className="h-4 w-4 text-gold-500" />
                    {roleLabel(user.role)} Dashboard
                  </a>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Guest: Admin login link
            <Link
              href="/admin"
              className="hidden rounded-full border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-600 transition hover:border-gold-400 hover:text-gold-600 lg:block dark:border-white/20 dark:text-white/70"
            >
              {t("admin")}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="rounded-full border border-primary-200 p-2 lg:hidden dark:border-white/20"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-primary-100 bg-white/95 px-4 py-4 backdrop-blur-sm lg:hidden dark:border-white/10 dark:bg-primary-900/95">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50 dark:text-white/80 dark:hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile auth */}
            {user ? (
              <>
                <div className="mt-2 border-t border-primary-100 pt-3 dark:border-white/10">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-white/40">
                    {user.username} · {roleLabel(user.role)}
                  </p>
                </div>
                <a
                  href={dashboardHref(user.role, locale)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50 dark:text-white/80 dark:hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4 text-gold-500" />
                  {roleLabel(user.role)} Dashboard
                </a>
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary-600 transition hover:bg-primary-50 dark:text-white/70 dark:hover:bg-white/10"
              >
                {t("admin")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
