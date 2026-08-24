"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
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
    <header className="sticky top-0 z-50 glass shadow-glass">
      <div className="container-page flex h-18 items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo-new.png"
            alt="Yerevan Real Estate"
            width={44}
            height={44}
            className="rounded-xl"
          />
          <span className="hidden font-serif text-lg font-bold tracking-tight text-primary-800 dark:text-white sm:block">
            Yerevan Real Estate
          </span>
        </Link>

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

          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-full border border-primary-200 p-2 text-primary-700 transition hover:border-primary-300 hover:bg-primary-50 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            href="/admin"
            className="hidden rounded-full border border-primary-200 px-3 py-1.5 text-sm font-medium text-primary-600 transition hover:border-gold-400 hover:text-gold-600 lg:block dark:border-white/20 dark:text-white/70"
          >
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
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary-600 transition hover:bg-primary-50 dark:text-white/70 dark:hover:bg-white/10"
            >
              {t("admin")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
