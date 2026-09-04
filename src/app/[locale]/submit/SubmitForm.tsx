"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Lock, UploadCloud, X } from "lucide-react";
import { districts } from "@/lib/mock-data";
import { streetsByDistrict } from "@/lib/yerevan-streets";

const inputCls = "w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400 dark:border-white/10 dark:bg-primary-800 dark:text-white";
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-white/60 mb-1";

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

  const [streetQuery, setStreetQuery] = useState("");
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const streetRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    propertyType: "", purpose: "", district: "",
    street: "", buildingNumber: "",
    price: "", currency: "AMD", description: "",
    rooms: "", floor: "", totalFloors: "", area: "", bedrooms: "", bathrooms: "",
    buildingType: "", openBalcony: "0", closedBalcony: "0",
    ceilingHeight: "", view: "",
  });

  // Street autocomplete
  useEffect(() => {
    if (!streetQuery || streetQuery.length < 1) { setStreetSuggestions([]); return; }
    const streets = streetsByDistrict[form.district] ?? [];
    const q = streetQuery.toLowerCase();
    // For short queries use startsWith so typing "A" shows A-streets, not every street containing "a"
    const filtered = q.length <= 2
      ? streets.filter((s) => s.toLowerCase().startsWith(q))
      : streets.filter((s) => s.toLowerCase().includes(q));
    // Deduplicate by lowercased name before showing
    const seen = new Set<string>();
    const unique = filtered.filter((s) => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setStreetSuggestions(unique.slice(0, 30));
  }, [streetQuery, form.district]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (streetRef.current && !streetRef.current.contains(e.target as Node)) {
        setStreetSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        if (res.ok) { const data = await res.json(); uploaded.push(data.url); }
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
      if (res.ok) { setSent(true); }
      else { setError("Something went wrong. Please try again."); }
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

      {/* Name */}
      <div>
        <label className={labelCls}>Full Name / Անուն Ազգանուն *</label>
        <input required placeholder={t("name")} value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
      </div>

      {/* Phone */}
      <div>
        <label className={labelCls}>Phone / Հեռ. *</label>
        <input required type="tel" placeholder={t("phone")} value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary-500 dark:text-white/50">
          <Lock className="h-3.5 w-3.5" /> {t("phoneNote")}
        </p>
      </div>

      {/* Email */}
      <div>
        <label className={labelCls}>Email</label>
        <input type="email" placeholder={t("email")} value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
      </div>

      {/* Type & Purpose */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Property Type / Տ. տեսակ *</label>
          <select required value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className={inputCls}>
            <option value="">{t("propertyType")}</option>
            {["apartment", "house", "commercial", "office", "land"].map((v) => (
              <option key={v} value={v}>{tTypes(v)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Purpose / Նպ. *</label>
          <select required value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })} className={inputCls}>
            <option value="">{t("purpose")}</option>
            <option value="rent">{tPurpose("rent")}</option>
            <option value="sale">{tPurpose("sale")}</option>
          </select>
        </div>
      </div>

      {/* District */}
      <div>
        <label className={labelCls}>District / Թաղ. *</label>
        <select required value={form.district}
          onChange={(e) => { setForm({ ...form, district: e.target.value, street: "" }); setStreetQuery(""); }} className={inputCls}>
          <option value="">{t("district")}</option>
          {districts.map((d) => (
            <option key={d} value={d}>{tDistricts(d)}</option>
          ))}
        </select>
      </div>

      {/* Street autocomplete */}
      <div ref={streetRef} className="relative">
        <label className={labelCls}>Street / Փողոց</label>
        <input
          placeholder="Type street name… / Մուտq. փողոց..."
          value={streetQuery}
          onChange={(e) => { setStreetQuery(e.target.value); setForm({ ...form, street: e.target.value }); }}
          className={inputCls}
          autoComplete="off"
        />
        {streetSuggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/10 dark:bg-primary-800">
            {streetSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStreetQuery(s); setForm({ ...form, street: s }); setStreetSuggestions([]); }}
                className="block w-full px-4 py-2.5 text-left text-sm text-primary-800 hover:bg-primary-50 dark:text-white dark:hover:bg-white/10"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Building number */}
      <div>
        <label className={labelCls}>Building Number / Շ. համ.</label>
        <input placeholder="e.g. 12, 7a…" value={form.buildingNumber}
          onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })} className={inputCls} />
      </div>

      {/* Price & Currency */}
      <div>
        <label className={labelCls}>Price / Գ. *</label>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <input required type="number" min="0" placeholder={t("price")} value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
          </div>
          <select value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>
            <option value="AMD">AMD ֏</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
          </select>
        </div>
      </div>

      {/* Rooms & Area */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Rooms / Սենy.</label>
          <select value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} className={inputCls}>
            <option value="">— Select —</option>
            {["1","2","3","4","5","6","6+"].map(v => <option key={v} value={v}>{v} room{v !== "1" ? "s" : ""}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Area m² / Մ²</label>
          <input type="number" min="0" placeholder="e.g. 75" value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })} className={inputCls} />
        </div>
      </div>

      {/* Floor / Total floors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Floor / Հ.</label>
          <input type="number" min="0" placeholder="e.g. 3" value={form.floor}
            onChange={(e) => setForm({ ...form, floor: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Total Floors / Ընդ. հ.</label>
          <input type="number" min="0" placeholder="e.g. 9" value={form.totalFloors}
            onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} className={inputCls} />
        </div>
      </div>

      {/* Bedrooms / Bathrooms */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Bedrooms / Ննj.</label>
          <input type="number" min="0" placeholder="e.g. 2" value={form.bedrooms}
            onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Bathrooms / Լ/Ս</label>
          <input type="number" min="0" placeholder="e.g. 1" value={form.bathrooms}
            onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className={inputCls} />
        </div>
      </div>

      {/* Building type */}
      <div>
        <label className={labelCls}>Building Type / Կ. տ.</label>
        <select value={form.buildingType} onChange={(e) => setForm({ ...form, buildingType: e.target.value })} className={inputCls}>
          <option value="">— Select / Ընt. —</option>
          <option value="panel">Panel / Պ.</option>
          <option value="newBuilding">New Building / Ն. կ.</option>
          <option value="stone">Stone / Ք.</option>
        </select>
      </div>

      {/* Balconies */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Open Balcony / Բ. պ.</label>
          <select value={form.openBalcony} onChange={(e) => setForm({ ...form, openBalcony: e.target.value })} className={inputCls}>
            <option value="0">None / Չ.</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Closed Balcony / Փ. պ.</label>
          <select value={form.closedBalcony} onChange={(e) => setForm({ ...form, closedBalcony: e.target.value })} className={inputCls}>
            <option value="0">None / Չ.</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
      </div>

      {/* Ceiling height / View */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Ceiling Height / Բ. բ.</label>
          <select value={form.ceilingHeight} onChange={(e) => setForm({ ...form, ceilingHeight: e.target.value })} className={inputCls}>
            <option value="">— Select —</option>
            <option value="2.6">2.6 m</option>
            <option value="2.8">2.8 m</option>
            <option value="3.0">3.0 m</option>
            <option value="3.2">3.2 m</option>
            <option value="3.2+">3.2+ m</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>View / Տ.</label>
          <select value={form.view} onChange={(e) => setForm({ ...form, view: e.target.value })} className={inputCls}>
            <option value="">— Select —</option>
            <option value="ararat">Ararat / Ա.</option>
            <option value="city">City / Ք.</option>
            <option value="garden">Garden / Այ.</option>
            <option value="street">Street / Փ.</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description / Ն. *</label>
        <textarea required rows={4} placeholder={t("description")} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
      </div>

      {/* Photos */}
      <div>
        <label className={labelCls}>Photos / Լ.</label>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-primary-200 p-6 text-sm text-primary-500 dark:border-white/15">
          <UploadCloud className="h-6 w-6" />
          {uploadingPhotos ? "Uploading…" : t("photos")}
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => handlePhotoChange(e.target.files)} />
        </label>
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
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
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting || uploadingPhotos} className="btn-gold w-full disabled:opacity-60">
        {submitting ? "Submitting…" : t("submitBtn")}
      </button>
    </form>
  );
}
