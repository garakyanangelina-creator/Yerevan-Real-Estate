"use client";

/**
 * Compact horizontal filter bar for Employee / Admin / Super-Admin listing views.
 * Uses the same district slugs as the rest of the system — no hardcoded district
 * names; the districts[] array from mock-data is the single source of truth.
 */

import { districts } from "@/lib/mock-data";

export interface StaffFilters {
  district: string;
  type: string;
  purpose: string;
  priceMin: string;
  priceMax: string;
  bedrooms: string;
  status: string;
}

export const emptyStaffFilters: StaffFilters = {
  district: "",
  type: "",
  purpose: "",
  priceMin: "",
  priceMax: "",
  bedrooms: "",
  status: "",
};

const DISTRICT_LABELS: Record<string, string> = {
  kentron: "Kentron", arabkir: "Arabkir", davtashen: "Davtashen",
  ajapnyak: "Ajapnyak", shengavit: "Shengavit", "kanaker-zeytun": "Kanaker-Zeytun",
  "nor-nork": "Nor Nork", "malatia-sebastia": "Malatia-Sebastia", avan: "Avan",
  erebuni: "Erebuni", "nork-marash": "Nork-Marash", nubarashen: "Nubarashen",
  other: "Other",
};

const selectCls =
  "rounded-lg border border-primary-100 bg-white px-2.5 py-2 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white";
const inputCls =
  "w-28 rounded-lg border border-primary-100 bg-white px-2.5 py-2 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white";

export default function StaffFilterBar({
  filters,
  onChange,
  onReset,
  showStatus = true,
}: {
  filters: StaffFilters;
  onChange: (f: StaffFilters) => void;
  onReset: () => void;
  showStatus?: boolean;
}) {
  function set<K extends keyof StaffFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const active = Object.values(filters).some(Boolean);

  return (
    <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-primary-100 bg-primary-50 p-3 dark:border-white/10 dark:bg-primary-800/40">
      {/* District — uses canonical slug list, same as listing creation form */}
      <select value={filters.district} onChange={(e) => set("district", e.target.value)} className={selectCls}>
        <option value="">All districts</option>
        {[...districts, "other"].map((d) => (
          <option key={d} value={d}>{DISTRICT_LABELS[d] ?? d}</option>
        ))}
      </select>

      {/* Property type */}
      <select value={filters.type} onChange={(e) => set("type", e.target.value)} className={selectCls}>
        <option value="">All types</option>
        <option value="apartment">Apartment</option>
        <option value="house">House</option>
        <option value="commercial">Commercial</option>
        <option value="office">Office</option>
        <option value="land">Land</option>
      </select>

      {/* Sale / Rent */}
      <select value={filters.purpose} onChange={(e) => set("purpose", e.target.value)} className={selectCls}>
        <option value="">Sale & Rent</option>
        <option value="sale">For Sale</option>
        <option value="rent">For Rent</option>
      </select>

      {/* Bedrooms */}
      <select value={filters.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className={selectCls}>
        <option value="">Any rooms</option>
        <option value="0">Studio</option>
        <option value="1">1 bedroom</option>
        <option value="2">2 bedrooms</option>
        <option value="3">3 bedrooms</option>
        <option value="4">4+ bedrooms</option>
      </select>

      {/* Price range */}
      <input
        type="number"
        min="0"
        placeholder="Price min"
        value={filters.priceMin}
        onChange={(e) => set("priceMin", e.target.value)}
        className={inputCls}
      />
      <input
        type="number"
        min="0"
        placeholder="Price max"
        value={filters.priceMax}
        onChange={(e) => set("priceMax", e.target.value)}
        className={inputCls}
      />

      {/* Status (optional — hide for employees if not needed) */}
      {showStatus && (
        <select value={filters.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
          <option value="archived">Archived</option>
        </select>
      )}

      {/* Reset */}
      {active && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-primary-200 px-3 py-2 text-xs font-medium text-primary-500 hover:border-red-300 hover:text-red-500 dark:border-white/20 dark:text-white/50"
        >
          ✕ Clear filters
        </button>
      )}
    </div>
  );
}

/** Apply StaffFilters to any listing array with these fields. */
export function applyStaffFilters<T extends {
  district: string; type: string; purpose: string;
  price: number; bedrooms: number; status: string;
}>(listings: T[], f: StaffFilters): T[] {
  return listings.filter((l) => {
    if (f.district && l.district !== f.district) return false;
    if (f.type && l.type !== f.type) return false;
    if (f.purpose && l.purpose !== f.purpose) return false;
    if (f.priceMin && l.price < Number(f.priceMin)) return false;
    if (f.priceMax && l.price > Number(f.priceMax)) return false;
    if (f.bedrooms) {
      const min = Number(f.bedrooms);
      if (min >= 4 ? l.bedrooms < 4 : l.bedrooms !== min) return false;
    }
    if (f.status && l.status !== f.status) return false;
    return true;
  });
}
