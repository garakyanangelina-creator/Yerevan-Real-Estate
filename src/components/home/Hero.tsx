"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import QuickSearchBar from "@/components/search/QuickSearchBar";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden sm:min-h-[680px]">
      <Image
        src="/hero-bg.jpg"
        alt="Yerevan city aerial view at sunset"
        fill
        priority
        className="object-cover object-center"
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/95 via-primary-900/60 to-primary-900/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 to-transparent" />

      <div className="container-page relative z-10 flex flex-col items-center gap-5 py-16 text-center text-white sm:gap-7 sm:py-28">
        {/* Badge */}
        <span className="animate-fade-in rounded-full border border-gold-400/40 bg-gold-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold-300 backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-xs">
          Premium Real Estate · Yerevan, Armenia
        </span>

        {/* Title */}
        <h1 className="animate-fade-in delay-100 max-w-3xl font-serif text-3xl font-bold leading-tight text-gold-300 sm:text-5xl lg:text-7xl">
          {t("title")}
        </h1>

        {/* Subtitle */}
        <div className="animate-fade-in delay-200 flex items-center gap-2 sm:gap-3">
          <div className="h-px w-8 bg-gold-400/60 sm:w-12" />
          <p className="max-w-xs text-sm text-gold-100/90 sm:max-w-xl sm:text-lg md:text-xl">
            {t("subtitle")}
          </p>
          <div className="h-px w-8 bg-gold-400/60 sm:w-12" />
        </div>

        {/* Search */}
        <div className="animate-fade-in delay-300 w-full max-w-2xl">
          <QuickSearchBar />
        </div>
      </div>
    </section>
  );
}
