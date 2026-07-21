"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, BedDouble, Bath, Ruler, MapPin, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatPrice } from "@/lib/utils";
import type { PublicProperty } from "@/types/property";

export default function PropertyCard({ property }: { property: PublicProperty }) {
  const t = useTranslations("property");
  const tTypes = useTranslations("propertyTypes");
  const tDistricts = useTranslations("districts");
  const [saved, setSaved] = useState(false);
  const coverImage = property.images[0] || "/images/placeholder-property.svg";

  return (
    <div className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-premium">
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          unoptimized
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Type badge */}
        <span className="absolute left-3 top-3 rounded-full bg-primary-900/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {tTypes(property.type)}
        </span>
        {/* Favourite */}
        <button
          onClick={() => setSaved((v) => !v)}
          aria-label={t("favorite")}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-primary-800 shadow-card backdrop-blur-sm transition hover:bg-white hover:scale-110"
        >
          <Heart className={saved ? "h-4 w-4 fill-gold-500 text-gold-500" : "h-4 w-4"} />
        </button>
        {/* Overlay shimmer on hover */}
        <div className="absolute inset-0 bg-primary-900/0 transition duration-300 group-hover:bg-primary-900/10" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Price + district */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary-800 dark:text-white">
            {formatPrice(property.price, property.purpose, property.currency)}
          </p>
          <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600 dark:bg-white/10 dark:text-white/70">
            <MapPin className="h-3 w-3" /> {tDistricts(property.district)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-2.5 line-clamp-1 font-serif text-base font-semibold text-primary-900 dark:text-white">
          {property.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-primary-500 dark:text-white/60">
          {property.description}
        </p>

        {/* Specs */}
        <div className="mt-4 flex items-center gap-4 border-t border-primary-100/60 pt-4 text-sm text-primary-600 dark:border-white/10 dark:text-white/60">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-gold-500" />
            {property.bedrooms === 0 ? t("studio") : property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-gold-500" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-gold-500" />
            {property.area} m²
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/property/${property.id}`}
          className="btn-primary mt-5 w-full gap-2 group/btn"
        >
          {t("viewDetails")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
