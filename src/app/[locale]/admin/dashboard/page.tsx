"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import {
  Users, LayoutDashboard, Building2,
  UserCheck, UserCog, Eye, EyeOff, Plus, X, Upload, ExternalLink,
} from "lucide-react";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/utils";
import AdminNav from "@/components/admin/AdminNav";
import MatchingClientsModal from "@/components/admin/MatchingClientsModal";
import { streetsByDistrict } from "@/lib/yerevan-streets";
import { compressImage } from "@/lib/compressImage";

interface DbListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  purpose: string;
  district: string;
  status: string;
  isPublished: boolean;
  createdAt: string;
  createdBy: { username: string };
}

interface UserRow {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const DISTRICTS = [
  { value: "kentron",         label: "Kentron / Կենտրոն" },
  { value: "arabkir",         label: "Arabkir / Արաբկիր" },
  { value: "davtashen",       label: "Davtashen / Դավթաշեն" },
  { value: "ajapnyak",        label: "Ajapnyak / Աջափնյակ" },
  { value: "shengavit",       label: "Shengavit / Շենգավիթ" },
  { value: "kanakerZeytun",   label: "Kanaker-Zeytun / Քանաքեռ-Զեյթուն" },
  { value: "norNork",         label: "Nor Nork / Նոր Նորք" },
  { value: "malatiaSebastia", label: "Malatia-Sebastia / Մալաթիա-Սեբաստիա" },
  { value: "avan",            label: "Avan / Ավան" },
  { value: "erebuni",         label: "Erebuni / Էրեբունի" },
  { value: "norkMarash",      label: "Nork-Marash / Նորք-Մարաշ" },
  { value: "nubarashen",      label: "Nubarashen / Նուբարաշեն" },
  { value: "other",           label: "Other / Այլ" },
];

function emptyForm() {
  return {
    title: "", description: "", type: "apartment", purpose: "sale",
    district: "kentron", street: "", buildingNumber: "",
    price: "", currency: "AMD",
    bedrooms: "1", bathrooms: "1", area: "", floor: "1", totalFloors: "9",
    ownerName: "", ownerPhone: "",
    featured: false,
    imageUrls: [] as string[],
  };
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-700/50">
        <Icon className="h-5 w-5 text-gold-500" />
      </div>
      <div>
        <p className="text-2xl font-bold text-primary-900 dark:text-white">{value}</p>
        <p className="text-sm text-primary-500 dark:text-white/60">{label}</p>
        {sub && <p className="text-xs text-primary-400 dark:text-white/40">{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "active",    label: "Active" },
  { value: "available", label: "Available" },
  { value: "sold",      label: "Sold" },
  { value: "rented",    label: "Rented" },
  { value: "archived",  label: "Archived" },
];

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sold:      "bg-primary-100 text-primary-700 dark:bg-primary-700/30 dark:text-white/60",
  rented:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  archived:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = useLocale();
  const [role, setRole] = useState<string | null>(null);
  const [dbListings, setDbListings] = useState<DbListing[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [matchesFor, setMatchesFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Create listing state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [streetQuery, setStreetQuery] = useState("");
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const streetRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls = "w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-white/60 mb-1";

  // Street autocomplete
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
      if (streetRef.current && !streetRef.current.contains(e.target as Node)) setStreetSuggestions([]);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function togglePublish(l: DbListing) {
    setToggling(l.id);
    await fetch(`/api/employee/listings/${l.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !l.isPublished }),
    });
    setDbListings((prev) => prev.map((x) => x.id === l.id ? { ...x, isPublished: !l.isPublished } : x));
    setToggling(null);
  }

  async function changeStatus(l: DbListing, newStatus: string) {
    setUpdatingStatus(l.id);
    await fetch(`/api/employee/listings/${l.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setDbListings((prev) => prev.map((x) => x.id === l.id ? { ...x, status: newStatus } : x));
    setUpdatingStatus(null);
  }

  useEffect(() => {
    const fromQuery = searchParams.get("matchesFor");
    if (fromQuery) setMatchesFor(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const listingsRes = await fetch("/api/employee/listings");

        if (listingsRes.status === 401) {
          router.replace("/admin");
          return;
        }

        const listingsData = listingsRes.ok ? await listingsRes.json() : { listings: [] };

        if (!active) return;
        setDbListings(listingsData.listings ?? []);

        const usersRes = await fetch("/api/super-admin/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users ?? []);
          setRole("super_admin");
        } else {
          setRole("admin");
        }
      } catch {
        if (active) router.replace("/admin");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [router]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const rawFile of Array.from(files)) {
      const file = await compressImage(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/employee/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) uploaded.push(data.url);
      } catch {}
    }
    if (uploaded.length > 0) setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...uploaded] }));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const builtAddress = [form.street, form.buildingNumber].filter(Boolean).join(", ") || null;
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
      area: 0,
      floor: 0,
      totalFloors: 0,
      images: form.imageUrls,
      featured: form.featured,
      amenities: {
        ...(form.street && { street: form.street }),
        ...(form.buildingNumber && { buildingNumber: form.buildingNumber }),
        ...(form.ownerName && { ownerName: form.ownerName }),
        ...(form.ownerPhone && { ownerPhone: form.ownerPhone }),
      },
    };
    const res = await fetch("/api/employee/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setShowCreate(false);
      setForm(emptyForm());
      setStreetQuery("");
      const listingsRes = await fetch("/api/employee/listings");
      const data = await listingsRes.json();
      setDbListings(data.listings ?? []);
    } else {
      const d = await res.json();
      setSaveError(d.error ?? "Failed to create listing.");
    }
  }

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === "admin" && u.isActive).length;
  const employeeCount = users.filter(u => u.role === "employee" && u.isActive).length;

  return (
    <div className="container-page py-10">
      <AdminNav active="dashboard" role={role ?? "admin"} />

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
            Dashboard
          </h1>
          <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-700 dark:bg-gold-900/30 dark:text-gold-300">
            {role === "super_admin" ? "Super Admin" : "Admin"}
          </span>
        </div>
        <button
          onClick={() => { setShowCreate(true); setForm(emptyForm()); setStreetQuery(""); setSaveError(""); }}
          className="flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-primary-900 shadow-sm hover:bg-gold-400 transition"
        >
          <Plus className="h-4 w-4" /> New Listing
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Total Listings" value={dbListings.length} sub={`${dbListings.filter(l => l.isPublished).length} published`} />
        {role === "super_admin" && (
          <>
            <StatCard icon={UserCog} label="Admins" value={adminCount} />
            <StatCard icon={UserCheck} label="Employees" value={employeeCount} />
          </>
        )}
      </div>

      {/* Create listing modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-primary-900">
            <div className="flex items-center justify-between border-b border-primary-100 px-6 py-4 dark:border-white/10">
              <h2 className="font-serif text-lg font-semibold text-primary-900 dark:text-white">
                New Listing / Նոր հայտ
              </h2>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4 p-6">
              {/* Title */}
              <div>
                <label className={labelCls}>Title / Վերնագիր *</label>
                <input required className={inputCls} placeholder="e.g. 3-room apartment in Kentron"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description / Նկարագրություն</label>
                <textarea rows={3} className={inputCls} placeholder="Describe the property…"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Type & Purpose */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Type / Տեսակ</label>
                  <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="apartment">Apartment / Բնակartan</option>
                    <option value="house">House / Տuun</option>
                    <option value="commercial">Commercial / Komerrcial</option>
                    <option value="office">Office / Grasenyak</option>
                    <option value="land">Land / Hoghamas</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Purpose / Նpataak</label>
                  <select className={inputCls} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                    <option value="sale">For Sale / Վaacharrk</option>
                    <option value="rent">For Rent / Varrtz</option>
                  </select>
                </div>
              </div>

              {/* District */}
              <div>
                <label className={labelCls}>District / Թaghamas</label>
                <select className={inputCls} value={form.district}
                  onChange={(e) => { setForm({ ...form, district: e.target.value, street: "" }); setStreetQuery(""); }}>
                  {DISTRICTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              {/* Street autocomplete */}
              <div ref={streetRef} className="relative">
                <label className={labelCls}>Street / Phoghos</label>
                <input className={inputCls} placeholder="Type street name…" value={streetQuery} autoComplete="off"
                  onChange={(e) => { setStreetQuery(e.target.value); setForm({ ...form, street: e.target.value }); }} />
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
                <label className={labelCls}>Building No. / Sh. ham.</label>
                <input className={inputCls} placeholder="e.g. 12, 7a"
                  value={form.buildingNumber} onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })} />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Price / Gin *</label>
                  <input required type="number" min="0" className={inputCls} value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <select className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                    <option value="AMD">AMD ֏</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </select>
                </div>
              </div>

              {/* Bedrooms / Bathrooms */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Bedrooms</label>
                  <input type="number" min="0" className={inputCls} value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Bathrooms</label>
                  <input type="number" min="0" className={inputCls} value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
                </div>
              </div>

              {/* Owner contacts */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/40 dark:bg-amber-900/20">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Owner Contacts (staff only)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Owner Name</label>
                    <input className={inputCls} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Owner Phone</label>
                    <input type="tel" className={inputCls} value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 rounded accent-gold-500" />
                <span className="text-sm font-medium text-primary-700 dark:text-white/80">Mark as Featured</span>
              </label>

              {/* Photo upload */}
              <div>
                <label className={labelCls}>Photos / Lus. (optional)</label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-primary-200 p-4 text-sm text-primary-500 dark:border-white/15 hover:border-gold-400 transition">
                  <Upload className="h-5 w-5" />
                  {uploading ? "Uploading…" : "Upload photos"}
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => handleUpload(e.target.files)} />
                </label>
                {form.imageUrls.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {form.imageUrls.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="h-16 w-full rounded-lg object-cover" />
                        <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {saveError && <p className="text-sm text-red-600">{saveError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="flex-1 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-primary-900 hover:bg-gold-400 disabled:opacity-60 transition">
                  {saving ? "Creating…" : "Create & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listings table */}
      {dbListings.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-serif text-xl font-semibold text-primary-900 dark:text-white">
            All Listings
          </h2>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-primary-100 dark:border-white/10">
                <tr className="text-primary-500 dark:text-white/60">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Publish</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {dbListings.map((l) => (
                  <tr key={l.id} className="border-b border-primary-50 dark:border-white/5">
                    <td className="px-4 py-3 font-medium text-primary-800 dark:text-white">{l.title}</td>
                    <td className="px-4 py-3">
                      {formatPrice(l.price, l.purpose as "sale" | "rent", l.currency)}
                    </td>
                    <td className="px-4 py-3 capitalize">{l.district}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        disabled={updatingStatus === l.id}
                        onChange={(e) => changeStatus(l, e.target.value)}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_COLORS[l.status] ?? STATUS_COLORS.available}`}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-primary-500 dark:text-white/60">{l.createdBy.username}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(l)}
                        disabled={toggling === l.id}
                        title={l.isPublished ? "Unpublish" : "Publish to website"}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                          l.isPublished
                            ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-primary-100 text-primary-500 hover:bg-gold-100 hover:text-gold-700 dark:bg-white/10 dark:text-white/50"
                        }`}
                      >
                        {l.isPublished ? <><Eye className="h-3 w-3" /> Published</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/${locale}/admin/listing/${l.id}`}
                        title="View full listing"
                        className="flex items-center gap-1 rounded-lg border border-primary-200 px-2.5 py-1 text-xs font-medium text-primary-600 hover:border-gold-400 hover:text-gold-600 dark:border-white/15 dark:text-white/60 dark:hover:border-gold-400 dark:hover:text-gold-400"
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {matchesFor && (
        <MatchingClientsModal propertyId={matchesFor} onClose={() => setMatchesFor(null)} />
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
