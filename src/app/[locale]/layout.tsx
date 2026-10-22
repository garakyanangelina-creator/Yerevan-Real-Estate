import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

const SITE_URL = "https://www.yerevanreal.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Next.js doesn't give us the full path here, so we produce the root-level
  // alternates. Per-page alternates (with the actual path) are set in each
  // page's own generateMetadata when needed; this covers the default/fallback.
  return {
    title: {
      default: "Yerevan Real Estate | Buy, Rent & Sell Property in Yerevan",
      template: "%s | Yerevan Real Estate",
    },
    description:
      "Premium real estate agency in Yerevan, Armenia. Find apartments, houses, commercial spaces for rent and sale across every district of Yerevan.",
    openGraph: {
      title: "Yerevan Real Estate",
      description: "Premium real estate agency in Yerevan, Armenia.",
      type: "website",
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        ru: `${SITE_URL}/ru`,
        hy: `${SITE_URL}/hy`,
        "x-default": `${SITE_URL}/en`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr">
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
