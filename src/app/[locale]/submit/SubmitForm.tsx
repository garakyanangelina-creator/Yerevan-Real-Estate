"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Lock, UploadCloud } from "lucide-react";
import { districts } from "@/lib/mock-data";

export default function SubmitForm() {
  const t = useTranslations("submit");
  const tTypes = useTranslations("propertyTypes");
  const tPurpose = useTranslations("purpose");
  const tDistricts = useTranslations("districts");

  const [sent, setSent] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 2: POST multipart form to /api/properties (owner phone stored server-side only,
    // never exposed via any public API response — see PropertyOwners table in README).
    setSent(true);
  }

  if (sent) {
    return <div className="card p-6 text-center text-primary-700 dark:text-white/80">{t("success")}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <input required placeholder={t("name")} className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <div>
        <input required type="tel" placeholder={t("phone")} className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary-500 dark:text-white/50">
          <Lock className="h-3.5 w-3.5" /> {t("phoneNote")}
        </p>
      </div>

      <input type="email" placeholder={t("email")} className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <div className="grid grid-cols-2 gap-3">
        <select required className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800">
          <option value="">{t("propertyType")}</option>
          {["apartment", "house", "commercial", "office", "land"].map((v) => (
            <option key={v} value={v}>{tTypes(v)}</option>
          ))}
        </select>
        <select required className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800">
          <option value="">{t("purpose")}</option>
          <option value="rent">{tPurpose("rent")}</option>
          <option value="sale">{tPurpose("sale")}</option>
        </select>
      </div>

      <input required placeholder={t("address")} className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <select required className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800">
        <option value="">{t("district")}</option>
        {districts.map((d) => (
          <option key={d} value={d}>{tDistricts(d)}</option>
        ))}
      </select>

      <input required type="number" placeholder={t("price")} className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <textarea required rows={4} placeholder={t("description")} className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-primary-200 p-6 text-sm text-primary-500 dark:border-white/15">
        <UploadCloud className="h-6 w-6" />
        {t("photos")}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
        />
        {photos.length > 0 && <span>{photos.length} file(s) selected</span>}
      </label>

      <button type="submit" className="btn-gold w-full">{t("submitBtn")}</button>
    </form>
  );
}
