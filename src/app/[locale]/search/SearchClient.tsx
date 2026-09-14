"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import FilterPanel, { emptyFilters, type Filters } from "@/components/search/FilterPanel";
import PropertyCard from "@/components/property/PropertyCard";
import EmptyState from "@/components/common/EmptyState";
import { matchesFilters, filtersFromParams, filtersToParams } from "@/lib/filterListings";
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
  const router = useRouter();
  const pathname = usePathname();

  // Initialise ALL filter fields from URL — this is the fix for priceMin/priceMax
  // being sent by QuickSearchBar but previously ignored by SearchClient.
  const [filters, setFilters] = useState<Filters>({
    ...emptyFilters,
    ...filtersFromParams(params),
  });
  const [sort, setSort] = useState<SortKey>("newest");

  // Sync filter state back to URL so the address bar is always bookmarkable/shareable
  // and QuickSearchBar → FilterPanel round-trip is seamless.
  const applyFilters = useCallback(
    (next: Filters) => {
      setFilters(next);
      const qs = filtersToParams(next).toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const results = useMemo(() => {
    let list = initialProperties.filter((p) => matchesFilters(p, filters));

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
        <FilterPanel
          filters={filters}
          onChange={applyFilters}
          onReset={() => applyFilters(emptyFilters)}
        />

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
                message={
                  initialError === "config"
                    ? tCommon("fetchErrorConfig")
                    : tCommon("fetchErrorNetwork")
                }
              />
            </div>
          ) : results.length === 0 ? (
            <p className="mt-10 text-center text-primary-500 dark:text-white/60">
              {t("noResults")}
            </p>
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
