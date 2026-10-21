"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("staff");
  const td = useTranslations("districts");

  function set<K extends keyof StaffFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const active = Object.values(filters).some(Boolean);

  return (
    <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-primary-100 bg-primary-50 p-3 dark:border-white/10 dark:bg-primary-800/40">
      {/* District */}
      <select value={filters.district} onChange={(e) => set("district", e.target.value)} className={selectCls}>
        <option value="">{t("allDistricts")}</option>
        {[...districts, "other"].map((d) => (
          <option key={d} value={d}>{td(d as Parameters<typeof td>[0])}</option>
        ))}
      </select>

      {/* Property type */}
      <select value={filters.type} onChange={(e) => set("type", e.target.value)} className={selectCls}>
        <option value="">{t("allTypes")}</option>
        <option value="apartment">{t("apartment")}</option>
        <option value="house">{t("house")}</option>
        <option value="commercial">{t("commercial")}</option>
        <option value="office">{t("office")}</option>
        <option value="land">{t("land")}</option>
      </select>

      {/* Sale / Rent */}
      <select value={filters.purpose} onChange={(e) => set("purpose", e.target.value)} className={selectCls}>
        <option value="">{t("saleAndRent")}</option>
        <option value="sale">{t("forSale")}</option>
        <option value="rent">{t("forRent")}</option>
      </select>

      {/* Bedrooms */}
      <select value={filters.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className={selectCls}>
        <option value="">{t("anyRooms")}</option>
        <option value="0">{t("studio")}</option>
        <option value="1">{t("bedroom1")}</option>
        <option value="2">{t("bedroom2")}</option>
        <option value="3">{t("bedroom3")}</option>
        <option value="4">{t("bedroom4plus")}</option>
      </select>

      {/* Price range */}
      <input
        type="number"
        min="0"
        placeholder={t("priceMin")}
        value={filters.priceMin}
        onChange={(e) => set("priceMin", e.target.value)}
        className={inputCls}
      />
      <input
        type="number"
        min="0"
        placeholder={t("priceMax")}
        value={filters.priceMax}
        onChange={(e) => set("priceMax", e.target.value)}
        className={inputCls}
      />

      {/* Status */}
      {showStatus && (
        <select value={filters.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
          <option value="">{t("allStatuses")}</option>
          <option value="available">{t("available")}</option>
          <option value="active">{t("active")}</option>
          <option value="sold">{t("sold")}</option>
          <option value="rented">{t("rented")}</option>
          <option value="archived">{t("archived")}</option>
        </select>
      )}

      {/* Reset */}
      {active && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-primary-200 px-3 py-2 text-xs font-medium text-primary-500 hover:border-red-300 hover:text-red-500 dark:border-white/20 dark:text-white/50"
        >
          ✕ {t("clearFilters")}
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
