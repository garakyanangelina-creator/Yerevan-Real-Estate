"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import QuickSearchBar from "@/components/search/QuickSearchBar";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[640px] items-center justify-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80"
        alt="Yerevan skyline"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/60 to-primary-900/30" />

      <div className="container-page relative z-10 flex flex-col items-center gap-6 py-24 text-center text-white">
        <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-base text-white/85 sm:text-lg">{t("subtitle")}</p>
        <QuickSearchBar />
      </div>
    </section>
  );
}
