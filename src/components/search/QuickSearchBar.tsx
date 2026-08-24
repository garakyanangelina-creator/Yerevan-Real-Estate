"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { districts } from "@/lib/mock-data";

export default function QuickSearchBar() {
  const t = useTranslations("search");
  const tTypes = useTranslations("propertyTypes");
  const tPurpose = useTranslations("purpose");
  const tDistricts = useTranslations("districts");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [district, setDistrict] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    if (purpose) params.set("purpose", purpose);
    if (district) params.set("district", district);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="glass mt-4 w-full rounded-2xl p-3 shadow-glass sm:p-4">
      {/* Search input full width on top */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full rounded-xl border border-white/30 bg-white/90 px-4 py-3 text-sm text-primary-900 outline-none placeholder:text-primary-400"
      />

      {/* Selects in 2-col grid on mobile, row on sm+ */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:grid-cols-3 sm:gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-white/30 bg-white/90 px-3 py-3 text-sm text-primary-900 outline-none"
        >
          <option value="">{t("type")}</option>
          {["apartment", "house", "commercial", "office", "land"].map((v) => (
            <option key={v} value={v}>{tTypes(v)}</option>
          ))}
        </select>

        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="rounded-xl border border-white/30 bg-white/90 px-3 py-3 text-sm text-primary-900 outline-none"
        >
          <option value="">{t("purpose")}</option>
          <option value="rent">{tPurpose("rent")}</option>
          <option value="sale">{tPurpose("sale")}</option>
        </select>

        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="col-span-2 rounded-xl border border-white/30 bg-white/90 px-3 py-3 text-sm text-primary-900 outline-none sm:col-span-1"
        >
          <option value="">{t("district")}</option>
          {districts.map((d) => (
            <option key={d} value={d}>{tDistricts(d)}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">
        <input
          type="number"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          placeholder={t("priceMin")}
          className="rounded-xl border border-white/30 bg-white/90 px-3 py-3 text-sm text-primary-900 outline-none placeholder:text-primary-400"
        />
        <input
          type="number"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder={t("priceMax")}
          className="rounded-xl border border-white/30 bg-white/90 px-3 py-3 text-sm text-primary-900 outline-none placeholder:text-primary-400"
        />
      </div>

      {/* Search button full width on mobile */}
      <button
        onClick={handleSearch}
        className="btn-gold mt-2 w-full sm:mt-3"
      >
        <Search className="h-4 w-4" />
        {t("title")}
      </button>
    </div>
  );
}
