"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, Moon, Sun, Globe, Home } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { localeNames, locales } from "@/i18n/routing";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();

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
    <header className="sticky top-0 z-50 glass">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-primary-800 dark:text-white">
          <Home className="h-5 w-5 text-gold-500" />
          Yerevan Real Estate
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-700 transition hover:text-gold-600 dark:text-white/80 dark:hover:text-gold-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-700 dark:border-white/20 dark:text-white"
              aria-label="Change language"
            >
              <Globe className="h-4 w-4" />
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
                    className="block px-4 py-2 text-sm text-primary-800 hover:bg-primary-50 dark:text-white dark:hover:bg-white/10"
                  >
                    {localeNames[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-full border border-primary-200 p-2 text-primary-700 dark:border-white/20 dark:text-white"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link href="/admin" className="hidden text-sm font-medium text-primary-600 hover:text-gold-600 lg:block dark:text-white/70">
            {t("admin")}
          </Link>

          <button
            className="rounded-full border border-primary-200 p-2 lg:hidden dark:border-white/20"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-primary-100 bg-white px-4 py-4 lg:hidden dark:border-white/10 dark:bg-primary-900">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-primary-700 dark:text-white/80"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setOpen(false)} className="text-sm font-medium text-primary-600 dark:text-white/70">
              {t("admin")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
