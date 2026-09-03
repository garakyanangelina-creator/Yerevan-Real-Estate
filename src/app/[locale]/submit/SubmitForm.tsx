"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Lock, UploadCloud, X } from "lucide-react";
import { districts } from "@/lib/mock-data";

export default function SubmitForm() {
  const t = useTranslations("submit");
  const tTypes = useTranslations("propertyTypes");
  const tPurpose = useTranslations("purpose");
  const tDistricts = useTranslations("districts");

  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    propertyType: "", purpose: "", address: "", district: "",
    price: "", description: "",
  });

  async function handlePhotoChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingPhotos(true);

    const newPreviews = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews((p) => [...p, ...newPreviews]);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/submit/upload", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          uploaded.push(data.url);
        }
      } catch {}
    }
    setUploadedUrls((u) => [...u, ...uploaded]);
    setUploadingPhotos(false);
  }

  function removePreview(i: number) {
    setPreviews((p) => p.filter((_, idx) => idx !== i));
    setUploadedUrls((u) => u.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photos: uploadedUrls }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return <div className="card p-6 text-center text-primary-700 dark:text-white/80">{t("success")}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <input required placeholder={t("name")} value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <div>
        <input required type="tel" placeholder={t("phone")} value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary-500 dark:text-white/50">
          <Lock className="h-3.5 w-3.5" /> {t("phoneNote")}
        </p>
      </div>

      <input type="email" placeholder={t("email")} value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <div className="grid grid-cols-2 gap-3">
        <select required value={form.propertyType}
          onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
          className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800">
          <option value="">{t("propertyType")}</option>
          {["apartment", "house", "commercial", "office", "land"].map((v) => (
            <option key={v} value={v}>{tTypes(v)}</option>
          ))}
        </select>
        <select required value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800">
          <option value="">{t("purpose")}</option>
          <option value="rent">{tPurpose("rent")}</option>
          <option value="sale">{tPurpose("sale")}</option>
        </select>
      </div>

      <input required placeholder={t("address")} value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <select required value={form.district}
        onChange={(e) => setForm({ ...form, district: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800">
        <option value="">{t("district")}</option>
        {districts.map((d) => (
          <option key={d} value={d}>{tDistricts(d)}</option>
        ))}
      </select>

      <input required type="number" placeholder={t("price")} value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <textarea required rows={4} placeholder={t("description")} value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800" />

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-primary-200 p-6 text-sm text-primary-500 dark:border-white/15">
        <UploadCloud className="h-6 w-6" />
        {uploadingPhotos ? "Uploading…" : t("photos")}
        <input type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handlePhotoChange(e.target.files)} />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt="" className="h-24 w-full rounded-lg object-cover" />
              <button type="button" onClick={() => removePreview(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-red-600">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting || uploadingPhotos} className="btn-gold w-full disabled:opacity-60">
        {submitting ? "Submitting…" : t("submitBtn")}
      </button>
    </form>
  );
}
