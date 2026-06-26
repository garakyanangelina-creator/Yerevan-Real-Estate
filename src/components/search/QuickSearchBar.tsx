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

  function handleSearch() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    if (purpose) params.set("purpose", purpose);
    if (district) params.set("district", district);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="glass mt-4 flex w-full max-w-3xl flex-col gap-3 rounded-2xl p-4 shadow-glass sm:flex-row sm:items-center">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        className="flex-1 rounded-xl border border-white/30 bg-white/90 px-4 py-3 text-sm text-primary-900 outline-none placeholder:text-primary-400"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="rounded-xl border border-white/30 bg-white/90 px-3 py-3 text-sm text-primary-900 outline-none"
      >
        <option value="">{t("type")}</option>
        {["apartment", "house", "commercial", "office", "land"].map((v) => (
          <option key={v} value={v}>
            {tTypes(v)}
          </option>
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
        className="rounded-xl border border-white/30 bg-white/90 px-3 py-3 text-sm text-primary-900 outline-none"
      >
        <option value="">{t("district")}</option>
        {districts.map((d) => (
          <option key={d} value={d}>
            {tDistricts(d)}
          </option>
        ))}
      </select>
      <button onClick={handleSearch} className="btn-gold whitespace-nowrap">
        <Search className="h-4 w-4" />
        {t("title")}
      </button>
    </div>
  );
}
