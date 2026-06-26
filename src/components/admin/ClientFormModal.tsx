"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { districts } from "@/lib/mock-data";
import type { Client, ClientInput } from "@/types/client";
import type { District, PropertyType, Purpose } from "@/types/property";

const PROPERTY_TYPES: PropertyType[] = ["apartment", "house", "commercial", "office", "land"];

function toInput(client: Client | null): ClientInput {
  if (!client) {
    return {
      fullName: "",
      phone: "",
      whatsapp: "",
      email: "",
      preferredLanguage: "en",
      propertyType: "apartment",
      purpose: "rent",
      preferredDistricts: [],
      minBudget: null,
      maxBudget: null,
      minArea: null,
      maxArea: null,
      bedrooms: null,
      bathrooms: null,
      furnished: "any",
      petsAllowed: false,
      parkingRequired: false,
      elevatorRequired: false,
      balconyRequired: false,
      notes: "",
      status: "active",
    };
  }
  return { ...client };
}

export default function ClientFormModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("clients");
  const tTypes = useTranslations("propertyTypes");
  const tPurpose = useTranslations("purpose");
  const tDistricts = useTranslations("districts");

  const [form, setForm] = useState<ClientInput>(toInput(client));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  function set<K extends keyof ClientInput>(key: K, value: ClientInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleDistrict(d: District) {
    set(
      "preferredDistricts",
      form.preferredDistricts.includes(d)
        ? form.preferredDistricts.filter((x) => x !== d)
        : [...form.preferredDistricts, d]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(client ? `/api/admin/clients/${client.id}` : "/api/admin/clients", {
        method: client ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("save_failed");
      onSaved();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  const numberField = (key: keyof ClientInput, label: string) => (
    <div>
      <label className="text-xs font-medium uppercase text-primary-500">{label}</label>
      <input
        type="number"
        value={(form[key] as number | null | undefined) ?? ""}
        onChange={(e) => set(key, (e.target.value === "" ? null : Number(e.target.value)) as never)}
        className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl2 bg-white p-6 shadow-soft dark:bg-primary-800"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
            {client ? t("editClient") : t("addClient")}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-primary-50 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("fullName")}</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("phone")}</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("whatsapp")}</label>
            <input
              type="tel"
              value={form.whatsapp ?? ""}
              onChange={(e) => set("whatsapp", e.target.value)}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("email")}</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("preferredLanguage")}</label>
            <select
              value={form.preferredLanguage}
              onChange={(e) => set("preferredLanguage", e.target.value as ClientInput["preferredLanguage"])}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="hy">Հայերեն</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("status")}</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as ClientInput["status"])}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            >
              <option value="active">{t("statusActive")}</option>
              <option value="paused">{t("statusPaused")}</option>
              <option value="closed">{t("statusClosed")}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("propertyType")}</label>
            <select
              value={form.propertyType}
              onChange={(e) => set("propertyType", e.target.value as PropertyType)}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            >
              {PROPERTY_TYPES.map((v) => (
                <option key={v} value={v}>{tTypes(v)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("purpose")}</label>
            <select
              value={form.purpose}
              onChange={(e) => set("purpose", e.target.value as Purpose)}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            >
              <option value="rent">{tPurpose("rent")}</option>
              <option value="sale">{tPurpose("sale")}</option>
            </select>
          </div>

          {numberField("minBudget", t("minBudget"))}
          {numberField("maxBudget", t("maxBudget"))}
          {numberField("minArea", t("minArea"))}
          {numberField("maxArea", t("maxArea"))}
          {numberField("bedrooms", t("bedrooms"))}
          {numberField("bathrooms", t("bathrooms"))}

          <div>
            <label className="text-xs font-medium uppercase text-primary-500">{t("furnished")}</label>
            <select
              value={form.furnished}
              onChange={(e) => set("furnished", e.target.value as ClientInput["furnished"])}
              className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
            >
              <option value="any">{t("furnishedAny")}</option>
              <option value="furnished">{t("furnishedFurnished")}</option>
              <option value="unfurnished">{t("furnishedUnfurnished")}</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium uppercase text-primary-500">{t("preferredDistricts")}</label>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {districts.map((d) => (
              <label key={d} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.preferredDistricts.includes(d)}
                  onChange={() => toggleDistrict(d)}
                  className="h-4 w-4 rounded border-primary-300 text-gold-500"
                />
                {tDistricts(d)}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(form.petsAllowed)}
              onChange={(e) => set("petsAllowed", e.target.checked)}
              className="h-4 w-4 rounded border-primary-300 text-gold-500"
            />
            {t("petsAllowed")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(form.parkingRequired)}
              onChange={(e) => set("parkingRequired", e.target.checked)}
              className="h-4 w-4 rounded border-primary-300 text-gold-500"
            />
            {t("parkingRequired")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(form.elevatorRequired)}
              onChange={(e) => set("elevatorRequired", e.target.checked)}
              className="h-4 w-4 rounded border-primary-300 text-gold-500"
            />
            {t("elevatorRequired")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(form.balconyRequired)}
              onChange={(e) => set("balconyRequired", e.target.checked)}
              className="h-4 w-4 rounded border-primary-300 text-gold-500"
            />
            {t("balconyRequired")}
          </label>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium uppercase text-primary-500">{t("notes")}</label>
          <textarea
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            className="mt-1 w-full rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">Something went wrong. Please try again.</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-outline">
            {t("cancel")}
          </button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
