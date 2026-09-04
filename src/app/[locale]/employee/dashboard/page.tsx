"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import {
  Plus, Pencil, Trash2, LogOut,
  Building2, CheckCircle2, XCircle, Upload, X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { streetsByDistrict } from "@/lib/yerevan-streets";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  type: string;
  purpose: string;
  district: string;
  address: string | null;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  images: string;
  amenities: string;
  status: string;
  isPublished: boolean;
  createdAt: string;
}

type FormMode = "list" | "create" | "edit" | "password";

const DISTRICTS = [
  { value: "kentron",          label: "Kentron / Կենտրոն" },
  { value: "arabkir",          label: "Arabkir / Արաբկիր" },
  { value: "davtashen",        label: "Davtashen / Դավթաշեն" },
  { value: "ajapnyak",         label: "Ajapnyak / Աջափնյակ" },
  { value: "shengavit",        label: "Shengavit / Շենգավիթ" },
  { value: "kanakerZeytun",    label: "Kanaker-Zeytun / Քանաքեռ-Զեյթուն" },
  { value: "norNork",          label: "Nor Nork / Նոր Նորք" },
  { value: "malatiaSebastia",  label: "Malatia-Sebastia / Մալաթիա-Սեբաստիա" },
  { value: "avan",             label: "Avan / Ավան" },
  { value: "erebuni",          label: "Erebuni / Էրեբունի" },
  { value: "norkMarash",       label: "Nork-Marash / Նորք-Մարաշ" },
  { value: "nubarashen",       label: "Nubarashen / Նուբարաշեն" },
  { value: "other",            label: "Other / Այլ" },
];

const AMENITY_KEYS = [
  { key: "parking",     label: "Parking / Կայանատեղի" },
  { key: "balcony",     label: "Balcony / Պատշգամբ" },
  { key: "furniture",   label: "Furnished / Կահավորված" },
  { key: "petFriendly", label: "Pet Friendly / Ընտանի կենդ." },
  { key: "newBuilding", label: "New Building / Նոր կառ." },
  { key: "elevator",    label: "Elevator / Վերելակ" },
  { key: "ac",          label: "AC / Կондեioner" },
  { key: "heating",     label: "Heating / Ջեռուցում" },
];

type AmenityMap = Record<string, boolean | string | number>;

function emptyForm() {
  return {
    title: "", description: "", type: "apartment", purpose: "sale",
    district: "kentron", street: "", buildingNumber: "", address: "",
    price: "", currency: "AMD",
    bedrooms: "1", bathrooms: "1", area: "", floor: "1", totalFloors: "9",
    rooms: "1",
    buildingType: "",
    openBalcony: "0",
    closedBalcony: "0",
    ceilingHeight: "",
    view: "",
    ownerName: "",
    ownerPhone: "",
    imageUrls: [] as string[],
    amenities: {} as AmenityMap,
    status: "available",
  };
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FormMode>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [codeSearch, setCodeSearch] = useState("");
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [unForm, setUnForm] = useState({ newUsername: "", password: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [accTab, setAccTab] = useState<"password" | "username">("password");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [streetQuery, setStreetQuery] = useState("");
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const streetDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streetQuery) { setStreetSuggestions([]); return; }
    const streets = streetsByDistrict[form.district] ?? [];
    const q = streetQuery.toLowerCase();
    const filtered = q.length <= 2
      ? streets.filter((s) => s.toLowerCase().startsWith(q))
      : streets.filter((s) => s.toLowerCase().includes(q));
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
    function close(e: MouseEvent) {
      if (streetDropRef.current && !streetDropRef.current.contains(e.target as Node)) setStreetSuggestions([]);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function fetchListings() {
    const res = await fetch("/api/employee/listings");
    if (res.status === 401) { router.replace("/admin"); return; }
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchListings(); }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  }

  function startCreate() {
    setForm(emptyForm());
    setEditId(null);
    setMode("create");
  }

  function startEdit(l: Listing) {
    const images = JSON.parse(l.images ?? "[]") as string[];
    const amenities = JSON.parse(l.amenities ?? "{}") as AmenityMap;
    const existingStreet = String(amenities.street ?? "");
    const existingBuilding = String(amenities.buildingNumber ?? "");
    setStreetQuery(existingStreet);
    setForm({
      title: l.title,
      description: l.description ?? "",
      type: l.type,
      purpose: l.purpose,
      district: l.district,
      street: existingStreet,
      buildingNumber: existingBuilding,
      address: l.address ?? "",
      price: String(l.price),
      currency: l.currency,
      bedrooms: String(l.bedrooms),
      bathrooms: String(l.bathrooms),
      area: String(l.area),
      floor: String(l.floor),
      totalFloors: String(l.totalFloors),
      rooms: String(amenities.rooms ?? "1"),
      buildingType: String(amenities.buildingType ?? ""),
      openBalcony: String(amenities.openBalcony ?? "0"),
      closedBalcony: String(amenities.closedBalcony ?? "0"),
      ceilingHeight: String(amenities.ceilingHeight ?? ""),
      view: String(amenities.view ?? ""),
      ownerName: String(amenities.ownerName ?? ""),
      ownerPhone: String(amenities.ownerPhone ?? ""),
      imageUrls: images,
      amenities: Object.fromEntries(
        Object.entries(amenities).filter(([k]) =>
          !["rooms","street","buildingNumber","buildingType","openBalcony","closedBalcony","ceilingHeight","view","ownerName","ownerPhone"].includes(k)
        )
      ) as AmenityMap,
      status: l.status,
    });
    setEditId(l.id);
    setMode("edit");
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/employee/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) {
          uploaded.push(data.url);
        } else {
          setUploadError(`Upload failed: ${data.error ?? res.status}`);
        }
      } catch (err) {
        setUploadError(`Upload error: ${String(err)}`);
      }
    }
    if (uploaded.length > 0) {
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...uploaded] }));
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((u) => u !== url) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const builtAddress = [form.street, form.buildingNumber].filter(Boolean).join(", ") || form.address || null;
    const payload = {
      title: form.title,
      description: form.description || null,
      type: form.type,
      purpose: form.purpose,
      district: form.district,
      address: builtAddress,
      price: Number(form.price) || 0,
      currency: form.currency,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
      floor: Number(form.floor) || 0,
      totalFloors: Number(form.totalFloors) || 0,
      images: form.imageUrls,
      amenities: {
        ...form.amenities,
        rooms: Number(form.rooms) || 1,
        ...(form.street && { street: form.street }),
        ...(form.buildingNumber && { buildingNumber: form.buildingNumber }),
        ...(form.buildingType && { buildingType: form.buildingType }),
        openBalcony: Number(form.openBalcony) || 0,
        closedBalcony: Number(form.closedBalcony) || 0,
        ...(form.ceilingHeight && { ceilingHeight: form.ceilingHeight }),
        ...(form.view && { view: form.view }),
        ...(form.ownerName && { ownerName: form.ownerName }),
        ...(form.ownerPhone && { ownerPhone: form.ownerPhone }),
      },
      status: form.status,
    };

    const url = editId ? `/api/employee/listings/${editId}` : "/api/employee/listings";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setMode("list");
      await fetchListings();
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/employee/listings/${id}`, { method: "DELETE" });
    setDeleting(null);
    await fetchListings();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    if (pwForm.next.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    setPwSaving(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    setPwSaving(false);
    if (res.ok) { setPwForm({ current: "", next: "", confirm: "" }); setPwSuccess("Password changed successfully."); }
    else { const d = await res.json(); setPwError(d.error ?? "Failed to change password."); }
  }

  async function handleChangeUsername(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (!unForm.newUsername.trim() || !unForm.password) { setPwError("All fields required."); return; }
    setPwSaving(true);
    const res = await fetch("/api/auth/change-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newUsername: unForm.newUsername.trim(), password: unForm.password }),
    });
    setPwSaving(false);
    if (res.ok) { setUnForm({ newUsername: "", password: "" }); setPwSuccess("Username changed successfully."); }
    else { const d = await res.json(); setPwError(d.error ?? "Failed to change username."); }
  }

  const toCode = (id: string) => id.slice(0, 6).toUpperCase();

  const inputCls = "w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-white/60 mb-1";

  // ── Account Settings (password + username) ────────────────────────────────
  if (mode === "password") {
    return (
      <div className="container-page py-10">
        <div className="flex items-center justify-between border-b border-primary-100 pb-4 dark:border-white/10">
          <span className="font-serif font-semibold text-primary-900 dark:text-white">Account Settings / Հաշվի կարգավորումներ</span>
          <button onClick={() => setMode("list")} className="btn-outline text-sm">← Back</button>
        </div>
        <div className="mt-8 max-w-sm">
          <div className="mb-6 flex gap-2">
            <button onClick={() => { setAccTab("password"); setPwError(""); setPwSuccess(""); }} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${accTab === "password" ? "bg-gold-500 text-primary-900" : "bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-white/70"}`}>Password / Գաղտնաբառ</button>
            <button onClick={() => { setAccTab("username"); setPwError(""); setPwSuccess(""); }} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${accTab === "username" ? "bg-gold-500 text-primary-900" : "bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-white/70"}`}>Username / Մուտքանուն</button>
          </div>
          {accTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className={labelCls}>Current Password / Ընթացիկ գաղտնաբառ</label>
                <input type="password" required className={inputCls} value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>New Password / Նոր գաղտնաբառ</label>
                <input type="password" required className={inputCls} value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Confirm New Password / Հաստատել</label>
                <input type="password" required className={inputCls} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
              </div>
              {pwError && <p className="text-sm text-red-600">{pwError}</p>}
              {pwSuccess && <p className="text-sm text-green-600">{pwSuccess}</p>}
              <button type="submit" disabled={pwSaving} className="btn-primary w-full disabled:opacity-60">{pwSaving ? "Saving…" : "Change Password / Փոխել"}</button>
            </form>
          )}
          {accTab === "username" && (
            <form onSubmit={handleChangeUsername} className="space-y-4">
              <div>
                <label className={labelCls}>New Username / Նոր մուտqanun</label>
                <input type="text" required autoComplete="off" className={inputCls} value={unForm.newUsername} onChange={(e) => setUnForm({ ...unForm, newUsername: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Confirm with Password / Հաստատել գաղտնաբառով</label>
                <input type="password" required className={inputCls} value={unForm.password} onChange={(e) => setUnForm({ ...unForm, password: e.target.value })} />
              </div>
              {pwError && <p className="text-sm text-red-600">{pwError}</p>}
              {pwSuccess && <p className="text-sm text-green-600">{pwSuccess}</p>}
              <button type="submit" disabled={pwSaving} className="btn-primary w-full disabled:opacity-60">{pwSaving ? "Saving…" : "Change Username / Փոխել"}</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  if (mode === "create" || mode === "edit") {
    return (
      <div className="container-page py-10">
        <div className="flex items-center justify-between border-b border-primary-100 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Image src="/logo-new.png" alt="" width={36} height={36} className="rounded-lg" />
            <span className="font-serif font-semibold text-primary-900 dark:text-white">
              {mode === "create" ? "Add Listing / Ավելացնել հայտ" : "Edit Listing / Խմբագրել հայտ"}
            </span>
          </div>
          <button onClick={() => setMode("list")} className="btn-outline text-sm">
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-4">

            {/* Title */}
            <div>
              <label className={labelCls}>Title / Վերնագիր *</label>
              <input required className={inputCls} placeholder="e.g. 3-room apartment in Kentron"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description / Նկարագրություն</label>
              <textarea rows={4} className={inputCls}
                placeholder="Describe the property… / Նկարագրեք գույքը…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Type & Purpose */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Type / Տեսակ</label>
                <select className={inputCls} value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="apartment">Apartment / Բնակարան</option>
                  <option value="house">House / Տուն</option>
                  <option value="commercial">Commercial / Կոմercial</option>
                  <option value="office">Office / Գրասենյակ</option>
                  <option value="land">Land / Հողամաս</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Purpose / Նպատակ</label>
                <select className={inputCls} value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                  <option value="sale">For Sale / Վաճառք</option>
                  <option value="rent">For Rent / Վարձ</option>
                </select>
              </div>
            </div>

            {/* District */}
            <div>
              <label className={labelCls}>District / Թաղամաս</label>
              <select className={inputCls} value={form.district}
                onChange={(e) => { setForm({ ...form, district: e.target.value, street: "", buildingNumber: "" }); setStreetQuery(""); }}>
                {DISTRICTS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Street autocomplete */}
            <div ref={streetDropRef} className="relative">
              <label className={labelCls}>Street / Փoclocc</label>
              <input
                className={inputCls}
                placeholder="Type street name... e.g. Komitas Ave"
                value={streetQuery}
                autoComplete="off"
                onChange={(e) => { setStreetQuery(e.target.value); setForm({ ...form, street: e.target.value }); }}
              />
              {streetSuggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-primary-100 bg-white shadow-lg dark:border-white/10 dark:bg-primary-800">
                  {streetSuggestions.map((s) => (
                    <button key={s} type="button"
                      onClick={() => { setStreetQuery(s); setForm({ ...form, street: s }); setStreetSuggestions([]); }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-primary-800 hover:bg-primary-50 dark:text-white dark:hover:bg-white/10">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Building number */}
            <div>
              <label className={labelCls}>Building No. / Շ. Hamlet.</label>
              <input className={inputCls} placeholder="e.g. 12, 7a"
                value={form.buildingNumber}
                onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })} />
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Price / Գին</label>
                <input type="number" min="0" className={inputCls} value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Currency / Արժույթ</label>
                <select className={inputCls} value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="AMD">AMD ֏</option>
                  <option value="USD">USD $</option>
                  <option value="EUR">EUR €</option>
                </select>
              </div>
            </div>

            {/* Owner contacts — visible only to employees/admins */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/40 dark:bg-amber-900/20">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Owner Contacts / Սեփականատիրոջ կապ (only visible to staff)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Owner Name / Անուն</label>
                  <input className={inputCls} placeholder="Full name / Անուն ազգանուն"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Owner Phone / Հեռ.</label>
                  <input className={inputCls} placeholder="+374 xx xxxxxx"
                    value={form.ownerPhone}
                    onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} />
                </div>
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Bedrooms / Bathrooms / Area */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Bedrooms / Ննջ.</label>
                <input type="number" min="0" className={inputCls} value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Bathrooms / Լ/Ս</label>
                <input type="number" min="0" className={inputCls} value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Area m² / Մ²</label>
                <input type="number" min="0" className={inputCls} value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })} />
              </div>
            </div>

            {/* Floor / Total Floors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Floor / Հարկ</label>
                <input type="number" min="0" className={inputCls} value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Total Floors / Ընդ. հարկ</label>
                <input type="number" min="0" className={inputCls} value={form.totalFloors}
                  onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} />
              </div>
            </div>

            {/* Rooms / Building Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Rooms / Սենյակ</label>
                <select className={inputCls} value={form.rooms}
                  onChange={(e) => setForm({ ...form, rooms: e.target.value })}>
                  {["1","2","3","4","5","6","6+"].map(v => (
                    <option key={v} value={v}>{v} {v === "1" ? "room / սենյակ" : "rooms / սենյակ"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Building Type / Կառ. Տ.</label>
                <select className={inputCls} value={form.buildingType}
                  onChange={(e) => setForm({ ...form, buildingType: e.target.value })}>
                  <option value="">— Select / Ընտրել —</option>
                  <option value="panel">Panel / Պանել</option>
                  <option value="newBuilding">New Building / Նոր կառ.</option>
                  <option value="stone">Stone / Քար</option>
                </select>
              </div>
            </div>

            {/* Balconies */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Open Balcony / Բաց պատ.</label>
                <select className={inputCls} value={form.openBalcony}
                  onChange={(e) => setForm({ ...form, openBalcony: e.target.value })}>
                  <option value="0">None / Չկա</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Closed Balcony / Փակ պատ.</label>
                <select className={inputCls} value={form.closedBalcony}
                  onChange={(e) => setForm({ ...form, closedBalcony: e.target.value })}>
                  <option value="0">None / Չկա</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
            </div>

            {/* Ceiling Height / View */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Ceiling Height / Առ. բ.</label>
                <select className={inputCls} value={form.ceilingHeight}
                  onChange={(e) => setForm({ ...form, ceilingHeight: e.target.value })}>
                  <option value="">— Select / Ընտրել —</option>
                  <option value="2.6">2.6 m</option>
                  <option value="2.8">2.8 m</option>
                  <option value="3.0">3.0 m</option>
                  <option value="3.2">3.2 m</option>
                  <option value="3.2+">3.2+ m</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>View / Տեսարան</label>
                <select className={inputCls} value={form.view}
                  onChange={(e) => setForm({ ...form, view: e.target.value })}>
                  <option value="">— Select / Ընտրել —</option>
                  <option value="ararat">Ararat / Արարատ</option>
                  <option value="city">City / Քաղաք</option>
                  <option value="garden">Garden / Այգի</option>
                  <option value="street">Street / Փողոց</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={labelCls}>Status / Կարգ.</label>
              <select className={inputCls} value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="available">Available / Հասanimus</option>
                <option value="sold">Sold / Վաճառված</option>
                <option value="rented">Rented / Վարձ</option>
              </select>
            </div>

            {/* Photo upload */}
            <div>
              <label className={labelCls}>Photos / Լուսանկարներ</label>
              <label
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary-200 py-4 text-sm text-primary-500 transition hover:border-gold-400 hover:text-gold-600 dark:border-white/10 dark:text-white/50 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading… / Բեռnavia…" : "Click to upload photos / Կտտացնել լուսանկար ավելացնելու"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </label>
              {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
              {form.imageUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {form.imageUrls.map((url) => (
                    <div key={url} className="relative">
                      <img src={url} alt="" className="h-24 w-full rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities */}
            <div>
              <label className={labelCls}>Amenities / Հարմ.</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITY_KEYS.map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-primary-700 dark:text-white/80">
                    <input
                      type="checkbox"
                      checked={!!form.amenities[key]}
                      onChange={(e) =>
                        setForm({ ...form, amenities: { ...form.amenities, [key]: e.target.checked } })
                      }
                      className="h-4 w-4 accent-gold-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="lg:col-span-2 flex justify-end gap-3 border-t border-primary-100 pt-6 dark:border-white/10">
            <button type="button" onClick={() => setMode("list")} className="btn-outline">
              Cancel / Չեղ.
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Saving…" : mode === "create" ? "Create Listing / Ստ. հայt" : "Save Changes / Պah. փ."}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Listings list ─────────────────────────────────────────────────────────
  return (
    <div className="container-page py-10">
      {/* Nav */}
      <div className="flex items-center justify-between border-b border-primary-100 pb-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Image src="/logo-new.png" alt="" width={36} height={36} className="rounded-lg" />
          <div>
            <p className="font-serif font-semibold text-primary-900 dark:text-white">Employee Portal / Աշ. Պanelelet</p>
            <p className="text-xs text-primary-400 dark:text-white/40">My Listings / Իmy հայտեր</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={startCreate} className="btn-primary gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Listing
          </button>
          <button onClick={() => setMode("password")} className="btn-outline text-sm">
            Change Password
          </button>
          <button onClick={logout} className="btn-outline gap-2 text-sm">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { icon: Building2, label: "Total / Ընդ.", value: listings.length },
          { icon: CheckCircle2, label: "Available / Հաunavail.", value: listings.filter(l => l.status === "available").length },
          { icon: XCircle, label: "Sold/Rented / Վաճ/Վ.", value: listings.filter(l => l.status !== "available").length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card flex items-center gap-3 p-4">
            <Icon className="h-5 w-5 text-gold-500" />
            <div>
              <p className="text-xl font-bold text-primary-900 dark:text-white">{value}</p>
              <p className="text-xs text-primary-500 dark:text-white/60">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Code search */}
      <div className="mt-6">
        <input
          value={codeSearch}
          onChange={(e) => setCodeSearch(e.target.value.toUpperCase())}
          placeholder="Search by code / Որ. ըst կodով (e.g. CM1ABC)"
          className="w-full max-w-sm rounded-xl border border-primary-100 px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-8 space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Building2 className="h-12 w-12 text-primary-200" />
          <p className="text-primary-500 dark:text-white/60">No listings yet. / Հայتеры չkyan.</p>
          <button onClick={startCreate} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> Add your first listing
          </button>
        </div>
      ) : (
        <div className="mt-8 card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary-100 dark:border-white/10">
              <tr className="text-primary-500 dark:text-white/60">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Title / Վ.</th>
                <th className="px-5 py-3">Price / Գ.</th>
                <th className="px-5 py-3">District / Թ.</th>
                <th className="px-5 py-3">Owner / Սep.</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.filter(l => !codeSearch || toCode(l.id).includes(codeSearch)).map((l) => {
                const images = JSON.parse(l.images ?? "[]") as string[];
                const amenities = JSON.parse(l.amenities ?? "{}") as AmenityMap;
                return (
                  <tr key={l.id} className="border-b border-primary-50 last:border-0 dark:border-white/5">
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-gold-100 px-2 py-1 font-mono text-xs font-bold text-gold-700 dark:bg-gold-500/20 dark:text-gold-300">
                        #{toCode(l.id)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {images[0] ? (
                          <img src={images[0]} alt="" className="h-10 w-14 rounded object-cover" />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded bg-primary-50 dark:bg-primary-700/30">
                            <Building2 className="h-4 w-4 text-primary-300" />
                          </div>
                        )}
                        <span className="font-medium text-primary-900 dark:text-white">{l.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {formatPrice(l.price, l.purpose as "sale" | "rent", l.currency)}
                    </td>
                    <td className="px-5 py-3 capitalize text-primary-500 dark:text-white/60">
                      {DISTRICTS.find(d => d.value === l.district)?.label?.split(" / ")[0] ?? l.district}
                    </td>
                    <td className="px-5 py-3">
                      {amenities.ownerPhone ? (
                        <div className="text-xs">
                          <div className="font-medium text-primary-800 dark:text-white/80">{String(amenities.ownerName || "—")}</div>
                          <div className="text-primary-500 dark:text-white/50">{String(amenities.ownerPhone)}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-primary-300 dark:text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        l.status === "available"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : l.status === "sold"
                          ? "bg-primary-100 text-primary-600 dark:bg-primary-700/30 dark:text-white/50"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(l)}
                          title="Edit"
                          className="rounded p-1.5 hover:bg-primary-50 dark:hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4 text-primary-500 dark:text-white/50" />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id, l.title)}
                          disabled={deleting === l.id}
                          title="Delete"
                          className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
