"use client";

import { useTranslations } from "next-intl";
import { districts } from "@/lib/mock-data";
import type { PropertyType, Purpose, District, PropertyAmenities } from "@/types/property";

export interface Filters {
  q: string;
  type: PropertyType | "";
  purpose: Purpose | "";
  district: District | "";
  priceMin: string;
  priceMax: string;
  bedrooms: string;
  bathrooms: string;
  areaMin: string;
  floor: string;
  amenities: Partial<PropertyAmenities>;
}

export const emptyFilters: Filters = {
  q: "",
  type: "",
  purpose: "",
  district: "",
  priceMin: "",
  priceMax: "",
  bedrooms: "",
  bathrooms: "",
  areaMin: "",
  floor: "",
  amenities: {},
};

const amenityKeys: (keyof PropertyAmenities)[] = [
  "parking",
  "balcony",
  "furniture",
  "petFriendly",
  "newBuilding",
  "elevator",
  "ac",
  "heating",
];

export default function FilterPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}) {
  const t = useTranslations("search");
  const tTypes = useTranslations("propertyTypes");
  const tPurpose = useTranslations("purpose");
  const tDistricts = useTranslations("districts");

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleAmenity(key: keyof PropertyAmenities) {
    onChange({
      ...filters,
      amenities: { ...filters.amenities, [key]: !filters.amenities[key] },
    });
  }

  return (
    <div className="card space-y-5 p-5">
      <div>
        <label className="text-xs font-medium uppercase text-primary-500">{t("title")}</label>
        <input
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder={t("placeholder")}
          className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm outline-none focus:border-gold-400 dark:border-white/10 dark:bg-primary-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium uppercase text-primary-500">{t("type")}</label>
          <select
            value={filters.type}
            onChange={(e) => set("type", e.target.value as Filters["type"])}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
          >
            <option value="">--</option>
            {["apartment", "house", "commercial", "office", "land"].map((v) => (
              <option key={v} value={v}>{tTypes(v)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-primary-500">{t("purpose")}</label>
          <select
            value={filters.purpose}
            onChange={(e) => set("purpose", e.target.value as Filters["purpose"])}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
          >
            <option value="">--</option>
            <option value="rent">{tPurpose("rent")}</option>
            <option value="sale">{tPurpose("sale")}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium uppercase text-primary-500">{t("district")}</label>
        <select
          value={filters.district}
          onChange={(e) => set("district", e.target.value as Filters["district"])}
          className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
        >
          <option value="">--</option>
          {districts.map((d) => (
            <option key={d} value={d}>{tDistricts(d)}</option>
          ))}
          <option value="other">{tDistricts("other")}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium uppercase text-primary-500">{t("priceMin")}</label>
          <input
            type="number"
            value={filters.priceMin}
            onChange={(e) => set("priceMin", e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-primary-500">{t("priceMax")}</label>
          <input
            type="number"
            value={filters.priceMax}
            onChange={(e) => set("priceMax", e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium uppercase text-primary-500">{t("bedrooms")}</label>
          <select
            value={filters.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
          >
            <option value="">--</option>
            <option value="0">Studio</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-primary-500">{t("bathrooms")}</label>
          <select
            value={filters.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
          >
            <option value="">--</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3+</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium uppercase text-primary-500">{t("area")}</label>
          <input
            type="number"
            value={filters.areaMin}
            onChange={(e) => set("areaMin", e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase text-primary-500">{t("floor")}</label>
          <input
            type="number"
            value={filters.floor}
            onChange={(e) => set("floor", e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-800"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium uppercase text-primary-500">{t("amenities")}</label>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {amenityKeys.map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!filters.amenities[key]}
                onChange={() => toggleAmenity(key)}
                className="h-4 w-4 rounded border-primary-300 text-gold-500"
              />
              {t(key)}
            </label>
          ))}
        </div>
      </div>

      <button onClick={onReset} className="btn-outline w-full">
        {t("reset")}
      </button>
    </div>
  );
}
