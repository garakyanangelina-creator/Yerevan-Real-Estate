"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, BedDouble, Bath, Ruler, MapPin } from "lucide-react";
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
    <div className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          unoptimized
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-primary-900/80 px-3 py-1 text-xs font-medium text-white">
          {tTypes(property.type)}
        </span>
        <button
          onClick={() => setSaved((v) => !v)}
          aria-label={t("favorite")}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-primary-800 shadow-soft transition hover:bg-white"
        >
          <Heart className={saved ? "h-4 w-4 fill-gold-500 text-gold-500" : "h-4 w-4"} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-primary-800 dark:text-white">
            {formatPrice(property.price, property.purpose, property.currency)}
          </p>
          <span className="flex items-center gap-1 text-xs text-primary-500 dark:text-white/60">
            <MapPin className="h-3.5 w-3.5" /> {tDistricts(property.district)}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-1 font-serif text-base font-medium text-primary-900 dark:text-white">
          {property.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-primary-600 dark:text-white/60">
          {property.description}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm text-primary-700 dark:text-white/70">
          <span className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            {property.bedrooms === 0 ? t("studio") : property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-4 w-4" /> {property.area} m²
          </span>
        </div>

        <Link
          href={`/property/${property.id}`}
          className="btn-primary mt-5 w-full"
        >
          {t("viewDetails")}
        </Link>
      </div>
    </div>
  );
}
