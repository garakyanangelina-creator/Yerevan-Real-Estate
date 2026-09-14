/**
 * Single shared filtering function used by every role:
 * Guest search page, Employee dashboard, Admin dashboard.
 *
 * Uses only stable internal slugs (district, type, purpose) — never translated
 * display names — so language changes never affect which properties are returned.
 */

import type { Filters } from "@/components/search/FilterPanel";

export interface FilterableProperty {
  district: string;
  type: string;
  purpose: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor: number;
  title?: string | null;
  description?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  amenities?: Record<string, any>;
}

export function matchesFilters<T extends FilterableProperty>(
  p: T,
  filters: Filters
): boolean {
  // Full-text search across title, description, district slug
  if (filters.q) {
    const hay = `${p.title ?? ""} ${p.description ?? ""} ${p.district}`.toLowerCase();
    if (!hay.includes(filters.q.toLowerCase())) return false;
  }

  // Exact slug matches — district is stored as kebab-case slug in DB,
  // filter value comes from the same districts[] array → always equal or empty
  if (filters.type && p.type !== filters.type) return false;
  if (filters.purpose && p.purpose !== filters.purpose) return false;
  if (filters.district && p.district !== filters.district) return false;

  // Price range (inclusive)
  if (filters.priceMin && p.price < Number(filters.priceMin)) return false;
  if (filters.priceMax && p.price > Number(filters.priceMax)) return false;

  // Bedrooms: "4" means 4-or-more
  if (filters.bedrooms) {
    const min = Number(filters.bedrooms);
    if (min >= 4 ? p.bedrooms < 4 : p.bedrooms !== min) return false;
  }

  // Bathrooms: "3" means 3-or-more
  if (filters.bathrooms) {
    const min = Number(filters.bathrooms);
    if (min >= 3 ? p.bathrooms < 3 : p.bathrooms !== min) return false;
  }

  if (filters.areaMin && p.area < Number(filters.areaMin)) return false;
  if (filters.floor && p.floor !== Number(filters.floor)) return false;

  // Amenity checkboxes — only when the listing exposes a parsed amenities object
  if (p.amenities) {
    for (const [key, value] of Object.entries(filters.amenities)) {
      if (value && !p.amenities[key]) return false;
    }
  }

  return true;
}

/** Parse all supported filter values out of a URLSearchParams / ReadonlyURLSearchParams. */
export function filtersFromParams(
  params: URLSearchParams | { get(key: string): string | null }
): Partial<Filters> {
  return {
    q: params.get("q") ?? "",
    type: (params.get("type") ?? "") as Filters["type"],
    purpose: (params.get("purpose") ?? "") as Filters["purpose"],
    district: (params.get("district") ?? "") as Filters["district"],
    priceMin: params.get("priceMin") ?? "",
    priceMax: params.get("priceMax") ?? "",
    bedrooms: params.get("bedrooms") ?? "",
    bathrooms: params.get("bathrooms") ?? "",
    areaMin: params.get("areaMin") ?? "",
    floor: params.get("floor") ?? "",
  };
}

/** Serialise a Filters object into URLSearchParams (omits empty values). */
export function filtersToParams(filters: Filters): URLSearchParams {
  const p = new URLSearchParams();
  const simple: (keyof Filters)[] = [
    "q", "type", "purpose", "district",
    "priceMin", "priceMax", "bedrooms", "bathrooms", "areaMin", "floor",
  ];
  for (const key of simple) {
    const v = filters[key];
    if (typeof v === "string" && v) p.set(key, v);
  }
  return p;
}
