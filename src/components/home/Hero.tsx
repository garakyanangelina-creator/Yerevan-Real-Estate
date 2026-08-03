"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import QuickSearchBar from "@/components/search/QuickSearchBar";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[680px] items-center justify-center overflow-hidden">
      <Image
        src="/hero-bg.jpg"
        alt="Yerevan city aerial view at sunset"
        fill
        priority
        className="object-cover"
      />
      {/* Multi-stop gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/95 via-primary-900/55 to-primary-900/20" />
      {/* Subtle left vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 to-transparent" />

      <div className="container-page relative z-10 flex flex-col items-center gap-7 py-28 text-center text-white">
        {/* Eyebrow badge */}
        <span className="animate-fade-in rounded-full border border-gold-400/40 bg-gold-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300 backdrop-blur-sm">
          Premium Real Estate · Yerevan, Armenia
        </span>

        <h1 className="animate-fade-in delay-100 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>

        {/* Gold accent line */}
        <div className="animate-fade-in delay-200 flex items-center gap-3">
          <div className="h-px w-12 bg-gold-400/60" />
          <p className="max-w-xl text-base text-white/80 sm:text-lg">{t("subtitle")}</p>
          <div className="h-px w-12 bg-gold-400/60" />
        </div>

        <div className="animate-fade-in delay-300 w-full max-w-2xl">
          <QuickSearchBar />
        </div>
      </div>
    </section>
  );
}
