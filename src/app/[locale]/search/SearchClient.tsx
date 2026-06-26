"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import FilterPanel, { emptyFilters, type Filters } from "@/components/search/FilterPanel";
import PropertyCard from "@/components/property/PropertyCard";
import EmptyState from "@/components/common/EmptyState";
import type { PropertyFetchErrorCode, PublicProperty } from "@/types/property";

type SortKey = "newest" | "priceLow" | "priceHigh" | "popular";

export default function SearchClient({
  initialProperties,
  initialError,
}: {
  initialProperties: PublicProperty[];
  initialError: PropertyFetchErrorCode;
}) {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const params = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    ...emptyFilters,
    q: params.get("q") ?? "",
    type: (params.get("type") as Filters["type"]) ?? "",
    purpose: (params.get("purpose") as Filters["purpose"]) ?? "",
    district: (params.get("district") as Filters["district"]) ?? "",
  });
  const [sort, setSort] = useState<SortKey>("newest");

  const results = useMemo(() => {
    let list = initialProperties.filter((p) => {
      if (filters.q && !`${p.title} ${p.address}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.purpose && p.purpose !== filters.purpose) return false;
      if (filters.district && p.district !== filters.district) return false;
      if (filters.priceMin && p.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && p.price > Number(filters.priceMax)) return false;
      if (filters.bedrooms) {
        const min = Number(filters.bedrooms);
        if (min >= 4 ? p.bedrooms < 4 : p.bedrooms !== min) return false;
      }
      if (filters.bathrooms) {
        const min = Number(filters.bathrooms);
        if (min >= 3 ? p.bathrooms < 3 : p.bathrooms !== min) return false;
      }
      if (filters.areaMin && p.area < Number(filters.areaMin)) return false;
      if (filters.floor && p.floor !== Number(filters.floor)) return false;
      for (const [key, value] of Object.entries(filters.amenities)) {
        if (value && !p.amenities[key as keyof typeof p.amenities]) return false;
      }
      return true;
    });

    switch (sort) {
      case "priceLow":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "popular":
        list = [...list].sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        list = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return list;
  }, [filters, sort, initialProperties]);

  return (
    <div className="container-page py-10">
      <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
        {t("title")}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <FilterPanel filters={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-primary-600 dark:text-white/70">
              {t("results", { count: results.length })}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
            >
              <option value="newest">{t("sortNewest")}</option>
              <option value="priceLow">{t("sortPriceLow")}</option>
              <option value="priceHigh">{t("sortPriceHigh")}</option>
              <option value="popular">{t("sortPopular")}</option>
            </select>
          </div>

          {initialError ? (
            <div className="mt-10">
              <EmptyState
                title={tCommon("fetchErrorTitle")}
                message={initialError === "config" ? tCommon("fetchErrorConfig") : tCommon("fetchErrorNetwork")}
              />
            </div>
          ) : results.length === 0 ? (
            <p className="mt-10 text-center text-primary-500 dark:text-white/60">{t("noResults")}</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
