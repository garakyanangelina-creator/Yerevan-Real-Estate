"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, LogOut,
  Building2, CheckCircle2, XCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

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

type FormMode = "list" | "create" | "edit";

const DISTRICTS = [
  { value: "kentron", label: "Kentron" },
  { value: "arabkir", label: "Arabkir" },
  { value: "davtashen", label: "Davtashen" },
  { value: "ajapnyak", label: "Ajapnyak" },
  { value: "shengavit", label: "Shengavit" },
  { value: "kanakerZeytun", label: "Kanaker-Zeytun" },
  { value: "norNork", label: "Nor Nork" },
  { value: "malatiaSebastia", label: "Malatia-Sebastia" },
  { value: "avan", label: "Avan" },
  { value: "erebuni", label: "Erebuni" },
  { value: "norkMarash", label: "Nork-Marash" },
  { value: "nubarashen", label: "Nubarashen" },
  { value: "other", label: "Other" },
];

const AMENITY_KEYS = [
  { key: "parking", label: "Parking" },
  { key: "balcony", label: "Balcony" },
  { key: "furniture", label: "Furnished" },
  { key: "petFriendly", label: "Pet Friendly" },
  { key: "newBuilding", label: "New Building" },
  { key: "elevator", label: "Elevator" },
  { key: "ac", label: "AC" },
  { key: "heating", label: "Heating" },
];

type AmenityMap = Record<string, boolean>;

function emptyForm() {
  return {
    title: "", description: "", type: "apartment", purpose: "sale",
    district: "kentron", address: "", price: "", currency: "AMD",
    bedrooms: "1", bathrooms: "1", area: "", floor: "1", totalFloors: "9",
    imageUrls: "",
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
  const [revealedImages, setRevealedImages] = useState<Record<string, boolean>>({});

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
    setForm({
      title: l.title,
      description: l.description ?? "",
      type: l.type,
      purpose: l.purpose,
      district: l.district,
      address: l.address ?? "",
      price: String(l.price),
      currency: l.currency,
      bedrooms: String(l.bedrooms),
      bathrooms: String(l.bathrooms),
      area: String(l.area),
      floor: String(l.floor),
      totalFloors: String(l.totalFloors),
      imageUrls: images.join("\n"),
      amenities,
      status: l.status,
    });
    setEditId(l.id);
    setMode("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const images = form.imageUrls
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    const payload = {
      title: form.title,
      description: form.description || null,
      type: form.type,
      purpose: form.purpose,
      district: form.district,
      address: form.address || null,
      price: Number(form.price) || 0,
      currency: form.currency,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
      floor: Number(form.floor) || 0,
      totalFloors: Number(form.totalFloors) || 0,
      images,
      amenities: form.amenities,
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

  const inputCls = "w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-white/60 mb-1";

  // ── Form ──────────────────────────────────────────────────────────────────
  if (mode === "create" || mode === "edit") {
    return (
      <div className="container-page py-10">
        <div className="flex items-center justify-between border-b border-primary-100 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="" width={36} height={36} className="rounded-lg" />
            <span className="font-serif font-semibold text-primary-900 dark:text-white">
              {mode === "create" ? "Add Listing" : "Edit Listing"}
            </span>
          </div>
          <button onClick={() => setMode("list")} className="btn-outline text-sm">
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input required className={inputCls} value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea rows={4} className={inputCls} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Type</label>
                <select className={inputCls} value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="commercial">Commercial</option>
                  <option value="office">Office</option>
                  <option value="land">Land</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Purpose</label>
                <select className={inputCls} value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>District</label>
              <select className={inputCls} value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}>
                {DISTRICTS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Address</label>
              <input className={inputCls} value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Price</label>
                <input type="number" min="0" className={inputCls} value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select className={inputCls} value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="AMD">AMD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
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
              <div>
                <label className={labelCls}>Area (m²)</label>
                <input type="number" min="0" className={inputCls} value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Floor</label>
                <input type="number" min="0" className={inputCls} value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Total Floors</label>
                <input type="number" min="0" className={inputCls} value={form.totalFloors}
                  onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Image URLs (one per line)</label>
              <textarea
                rows={4}
                className={inputCls}
                placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                value={form.imageUrls}
                onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
              />
              <p className="mt-1 text-xs text-primary-400">Paste full image URLs, one per line</p>
            </div>

            <div>
              <label className={labelCls}>Amenities</label>
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

          {/* Submit — full width */}
          <div className="lg:col-span-2 flex justify-end gap-3 border-t border-primary-100 pt-6 dark:border-white/10">
            <button type="button" onClick={() => setMode("list")} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Saving…" : mode === "create" ? "Create Listing" : "Save Changes"}
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
          <Image src="/logo.svg" alt="" width={36} height={36} className="rounded-lg" />
          <div>
            <p className="font-serif font-semibold text-primary-900 dark:text-white">Employee Portal</p>
            <p className="text-xs text-primary-400 dark:text-white/40">My Listings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={startCreate} className="btn-primary gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Listing
          </button>
          <button onClick={logout} className="btn-outline gap-2 text-sm">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { icon: Building2, label: "Total Listings", value: listings.length },
          { icon: CheckCircle2, label: "Available", value: listings.filter(l => l.status === "available").length },
          { icon: XCircle, label: "Sold / Rented", value: listings.filter(l => l.status !== "available").length },
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

      {/* Table */}
      {loading ? (
        <div className="mt-8 space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Building2 className="h-12 w-12 text-primary-200" />
          <p className="text-primary-500 dark:text-white/60">No listings yet.</p>
          <button onClick={startCreate} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> Add your first listing
          </button>
        </div>
      ) : (
        <div className="mt-8 card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary-100 dark:border-white/10">
              <tr className="text-primary-500 dark:text-white/60">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">District</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Published</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => {
                const images = JSON.parse(l.images ?? "[]") as string[];
                return (
                  <tr key={l.id} className="border-b border-primary-50 last:border-0 dark:border-white/5">
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
                      {DISTRICTS.find(d => d.value === l.district)?.label ?? l.district}
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
                      {l.isPublished ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-xs text-primary-400 dark:text-white/30">Draft</span>
                      )}
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
