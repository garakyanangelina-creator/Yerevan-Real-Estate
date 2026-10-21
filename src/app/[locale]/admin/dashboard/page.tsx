"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import {
  Users, LayoutDashboard, Building2,
  UserCheck, UserCog, Eye, EyeOff, Plus, X, Upload, ExternalLink, RefreshCw,
  MapPin, BedDouble, Bath, Ruler, Layers, TreePine,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import AdminNav from "@/components/admin/AdminNav";
import MatchingClientsModal from "@/components/admin/MatchingClientsModal";
import { streetsByDistrict } from "@/lib/yerevan-streets";
import { transliterateQuery } from "@/lib/transliterate";
import StaffFilterBar, {
  emptyStaffFilters,
  type StaffFilters,
} from "@/components/staff/StaffFilterBar";
import { compressImage } from "@/lib/compressImage";
import PropertyTypeFields, { emptyTypeFields, type TypeFields } from "@/components/staff/PropertyTypeFields";

interface DbListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  purpose: string;
  district: string;
  status: string;
  isPublished: boolean;
  createdAt: string;
  images: string;
  amenities: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  landArea: number | null;
  listingCode: number | null;
  titleEn: string | null;
  titleRu: string | null;
  titleHy: string | null;
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
  { value: "kentron" },
  { value: "arabkir" },
  { value: "davtashen" },
  { value: "ajapnyak" },
  { value: "shengavit" },
  { value: "kanaker-zeytun" },
  { value: "nor-nork" },
  { value: "malatia-sebastia" },
  { value: "avan" },
  { value: "erebuni" },
  { value: "nork-marash" },
  { value: "nubarashen" },
  { value: "other" },
];

function emptyForm() {
  return {
    title: "", description: "", type: "apartment", purpose: "sale",
    district: "kentron", street: "", buildingNumber: "",
    price: "", currency: "AMD",
    ownerName: "", ownerPhone: "",
    featured: false,
    imageUrls: [] as string[],
    typeFields: emptyTypeFields(),
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

const STATUS_OPTION_KEYS = ["active", "available", "sold", "rented", "archived"] as const;

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sold:      "bg-primary-100 text-primary-700 dark:bg-primary-700/30 dark:text-white/60",
  rented:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  archived:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface AdminCardProps {
  listing: DbListing;
  locale: string;
  toggling: boolean;
  updatingStatus: boolean;
  onPublishToggle: () => void;
  onStatusChange: (status: string) => void;
  onViewMatches: () => void;
}

function AdminListingCard({ listing: l, locale, toggling, updatingStatus, onPublishToggle, onStatusChange, onViewMatches }: AdminCardProps) {
  const tTypes = useTranslations("propertyTypes");
  const tDistricts = useTranslations("districts");
  const tPurpose = useTranslations("purpose");
  const tAdmin = useTranslations("admin");
  const tF = useTranslations("listingForm");
  const tNav = useTranslations("nav");
  const tStatus = useTranslations("status");
  const STATUS_KEYS = ["active", "available", "sold", "rented", "archived"] as const;
  type StatusKey = typeof STATUS_KEYS[number];

  const imgs: string[] = (() => { try { return JSON.parse(l.images); } catch { return []; } })();
  const thumb = imgs[0] ?? null;
  const displayCode = l.listingCode ? String(l.listingCode).padStart(4, "0") : null;

  const hasFloor = ["apartment", "office", "studio", "penthouse"].includes(l.type);
  const isHouse  = ["house", "villa"].includes(l.type);
  const isLand   = l.type === "land";

  return (
    <div className="card group flex flex-col overflow-hidden">
      {/* Photo */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-primary-50 dark:bg-primary-800/30">
        {thumb ? (
          <Image
            src={thumb}
            alt={l.title}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-10 w-10 text-primary-200 dark:text-primary-600" />
          </div>
        )}

        {/* Top-left: status + draft badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[l.status] ?? STATUS_COLORS.available}`}>
            {STATUS_KEYS.includes(l.status as StatusKey) ? tStatus(l.status as StatusKey) : l.status}
          </span>
          {!l.isPublished && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {tAdmin("draft")}
            </span>
          )}
        </div>

        {/* Top-right: listing code */}
        {displayCode && (
          <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
            #{displayCode}
          </span>
        )}

        {/* Bottom: type + purpose */}
        <span className="absolute bottom-3 left-3 rounded-full bg-primary-900/75 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {tTypes(l.type)} · {tPurpose(l.purpose as "rent" | "sale")}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-bold text-gold-600">
          {formatPrice(l.price, l.purpose as "sale" | "rent", l.currency)}
        </p>
        <h3 className="mt-0.5 line-clamp-1 font-serif text-sm font-semibold text-primary-900 dark:text-white">
          {(locale === "ru" && l.titleRu) || (locale === "en" && l.titleEn) || (locale === "hy" && l.titleHy) || l.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-primary-500 dark:text-white/50">
          <MapPin className="h-3 w-3" /> {tDistricts(l.district)}
        </p>

        {/* Specs row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary-600 dark:text-white/60">
          {l.area > 0 && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-gold-500" /> {l.area} m²
            </span>
          )}
          {!isLand && l.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-gold-500" /> {l.bedrooms}
            </span>
          )}
          {!isLand && l.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-gold-500" /> {l.bathrooms}
            </span>
          )}
          {hasFloor && l.floor > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-gold-500" /> {l.floor}/{l.totalFloors}
            </span>
          )}
          {isHouse && (l.landArea ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <TreePine className="h-3.5 w-3.5 text-gold-500" /> {l.landArea} m²
            </span>
          )}
          <span className="ml-auto text-primary-400 dark:text-white/30">
            {l.createdBy.username}
          </span>
        </div>

        {/* Status select */}
        <select
          value={l.status}
          disabled={updatingStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className={`mt-3 w-full cursor-pointer rounded-lg border-0 px-3 py-1.5 text-xs font-semibold focus:outline-none disabled:opacity-50 ${STATUS_COLORS[l.status] ?? STATUS_COLORS.available}`}
        >
          {STATUS_OPTION_KEYS.map((v) => (
            <option key={v} value={v}>{tStatus(v)}</option>
          ))}
        </select>

        {/* Actions */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`/${locale}/admin/listing/${l.id}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary-900 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-800 dark:bg-white/10 dark:hover:bg-white/20"
          >
            <ExternalLink className="h-3.5 w-3.5" /> {tAdmin("viewEdit")}
          </a>
          <button
            onClick={onPublishToggle}
            disabled={toggling}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
              l.isPublished
                ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-amber-100 text-amber-700 hover:bg-green-100 hover:text-green-600 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            {l.isPublished
              ? <><Eye className="h-3.5 w-3.5" /> {tAdmin("published")}</>
              : <><EyeOff className="h-3.5 w-3.5" /> {tAdmin("draft")}</>}
          </button>
          <button
            onClick={onViewMatches}
            className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-gold-300 px-3 py-1.5 text-xs font-medium text-gold-700 transition hover:bg-gold-50 dark:border-gold-600/40 dark:text-gold-400 dark:hover:bg-gold-900/10"
          >
            <Users className="h-3.5 w-3.5" /> {tAdmin("matchingClients")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = useLocale();
  const tL = useTranslations("listing");
  const tAdmin = useTranslations("admin");
  const tF = useTranslations("listingForm");
  const tNav = useTranslations("nav");
  const tTypes = useTranslations("propertyTypes");
  const tPurpose = useTranslations("purpose");
  const tDistricts = useTranslations("districts");
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
  const [staffFilters, setStaffFilters] = useState<StaffFilters>(emptyStaffFilters);
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
    const q = transliterateQuery(streetQuery);
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

  // Closing the street suggestions via blur+timeout is the correct cross-platform approach.
  // A document "mousedown" listener fails on iOS Safari because tapping a non-focusable
  // element (like a <button> inside the list) causes iOS to fire mousedown on the body
  // rather than the button, making the dropdown close before the click event fires.
  // The 150 ms delay lets the click handler run before blur clears the list.
  function closeStreetSuggestionsDelayed() {
    setTimeout(() => setStreetSuggestions([]), 150);
  }

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
    setSaveError("");
    const uploaded: string[] = [];
    for (const rawFile of Array.from(files)) {
      const file = await compressImage(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/employee/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) {
          uploaded.push(data.url);
        } else {
          setSaveError(tF("uploadFailed"));
        }
      } catch {
        setSaveError(tF("networkError"));
      }
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
    const tf = form.typeFields;
    const payload = {
      title: form.title,
      description: form.description || null,
      type: form.type,
      purpose: form.purpose,
      district: form.district,
      address: builtAddress,
      price: Number(form.price) || 0,
      currency: form.currency,
      bedrooms: Number(tf.bedrooms) || 0,
      bathrooms: Number(tf.bathrooms) || 0,
      area: Number(tf.area) || 0,
      floor: Number(tf.floor) || 0,
      totalFloors: Number(tf.totalFloors) || 0,
      landArea: Number(tf.landArea) || 0,
      renovation: tf.renovation || null,
      streetLine: tf.streetLine || null,
      storefront: tf.storefront === 'true' ? true : tf.storefront === 'false' ? false : null,
      commercialLevel: tf.commercialLevel || null,
      images: form.imageUrls,
      featured: form.featured,
      amenities: {
        rooms: Number(tf.rooms) || 1,
        ...(tf.buildingType && { buildingType: tf.buildingType }),
        openBalcony: Number(tf.openBalcony) || 0,
        closedBalcony: Number(tf.closedBalcony) || 0,
        ...(tf.ceilingHeight && { ceilingHeight: tf.ceilingHeight }),
        ...(tf.view && { view: tf.view }),
        ...(form.street && { street: form.street }),
        ...(form.buildingNumber && { buildingNumber: form.buildingNumber }),
        ...(form.ownerName && { ownerName: form.ownerName }),
        ...(form.ownerPhone && { ownerPhone: form.ownerPhone }),
      },
    };
    try {
      const res = await fetch("/api/employee/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm(emptyForm());
        setStreetQuery("");
        const listingsRes = await fetch("/api/employee/listings");
        const data = await listingsRes.json();
        setDbListings(data.listings ?? []);
      } else {
        const d = await res.json().catch(() => ({}));
        setSaveError(d.error ?? `Server error (${res.status}). Try again.`);
      }
    } catch {
      setSaveError(tF("networkError"));
    } finally {
      setSaving(false);
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
            {tNav("dashboard")}
          </h1>
          <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-700 dark:bg-gold-900/30 dark:text-gold-300">
            {role === "super_admin" ? tNav("superAdmin") : tNav("admin")}
          </span>
        </div>
        <button
          onClick={() => { setShowCreate(true); setForm(emptyForm()); setStreetQuery(""); setSaveError(""); }}
          className="flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-primary-900 shadow-sm hover:bg-gold-400 transition"
        >
          <Plus className="h-4 w-4" /> {tF("newListing")}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label={tAdmin("properties")} value={dbListings.length} sub={`${dbListings.filter(l => l.isPublished).length} ${tAdmin("published")}`} />
        {role === "super_admin" && (
          <>
            <StatCard icon={UserCog} label={tNav("admin")} value={adminCount} />
            <StatCard icon={UserCheck} label={tNav("users")} value={employeeCount} />
          </>
        )}
      </div>

      {/* Create listing modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-primary-900">
            <div className="flex items-center justify-between border-b border-primary-100 px-6 py-4 dark:border-white/10">
              <h2 className="font-serif text-lg font-semibold text-primary-900 dark:text-white">
                {tF("newListing")}
              </h2>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4 p-6">
              {/* Title */}
              <div>
                <label className={labelCls}>{tF("titleLabel")}</label>
                <input required className={inputCls} placeholder={tF("titlePlaceholder")}
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>{tF("descriptionLabel")}</label>
                <textarea rows={3} className={inputCls} placeholder={tF("descriptionPlaceholder")}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Type & Purpose */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{tF("typeLabel")}</label>
                  <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="apartment">{tTypes("apartment")}</option>
                    <option value="house">{tTypes("house")}</option>
                    <option value="commercial">{tTypes("commercial")}</option>
                    <option value="office">{tTypes("office")}</option>
                    <option value="land">{tTypes("land")}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{tF("purposeLabel")}</label>
                  <select className={inputCls} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                    <option value="sale">{tPurpose("sale")}</option>
                    <option value="rent">{tPurpose("rent")}</option>
                  </select>
                </div>
              </div>

              {/* District */}
              <div>
                <label className={labelCls}>{tF("districtLabel")}</label>
                <select className={inputCls} value={form.district}
                  onChange={(e) => { setForm({ ...form, district: e.target.value, street: "" }); setStreetQuery(""); }}>
                  {DISTRICTS.map((d) => <option key={d.value} value={d.value}>{tDistricts(d.value as Parameters<typeof tDistricts>[0])}</option>)}
                </select>
              </div>

              {/* Street autocomplete */}
              <div ref={streetRef} className="relative">
                <label className={labelCls}>{tF("streetLabel")}</label>
                <div className="relative">
                  <input className={inputCls} placeholder={tF("streetPlaceholder")} value={streetQuery} autoComplete="off"
                    onChange={(e) => { setStreetQuery(e.target.value); setForm({ ...form, street: e.target.value }); }}
                    onBlur={closeStreetSuggestionsDelayed} />
                  {streetQuery && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setStreetQuery(""); setForm({ ...form, street: "" }); setStreetSuggestions([]); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-primary-400 hover:text-primary-700 dark:text-white/40 dark:hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {streetSuggestions.length > 0 && (
                  <div
                    className="absolute z-20 mt-1 w-full overflow-y-auto rounded-xl border border-primary-100 bg-white shadow-lg dark:border-white/10 dark:bg-primary-800"
                    style={{ maxHeight: "12rem" }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {streetSuggestions.map((s) => (
                      <button key={s} type="button"
                        onClick={() => { setStreetQuery(s); setForm({ ...form, street: s }); setStreetSuggestions([]); }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-primary-800 hover:bg-primary-50 dark:text-white dark:hover:bg-white/10">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {streetQuery.length >= 2 && streetSuggestions.length === 0 && (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xs text-primary-400 dark:text-white/40">{tF("noStreetsFound")}</p>
                    <button type="button"
                      onClick={() => { const q = streetQuery; setStreetQuery(""); setTimeout(() => setStreetQuery(q), 50); }}
                      className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:underline dark:text-gold-400">
                      <RefreshCw className="h-3 w-3" />{tF("retry")}
                    </button>
                  </div>
                )}
              </div>

              {/* Building number */}
              <div>
                <label className={labelCls}>{tF("buildingLabel")}</label>
                <input className={inputCls} placeholder={tF("buildingPlaceholder")}
                  value={form.buildingNumber} onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })} />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>{tF("priceLabel")}</label>
                  <input required type="number" min="0" className={inputCls} value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>{tF("currencyLabel")}</label>
                  <select className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                    <option value="AMD">AMD ֏</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </select>
                </div>
              </div>

              {/* Type-specific fields — changes dynamically with Property Type */}
              <PropertyTypeFields
                type={form.type}
                fields={form.typeFields}
                onChange={(patch) => setForm((f) => ({ ...f, typeFields: { ...f.typeFields, ...patch } }))}
              />

              {/* Owner Contacts */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  {tL("ownerContacts")}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{tF("ownerNameLabel")}</label>
                    <input className={inputCls} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>{tF("ownerPhoneLabel")}</label>
                    <input type="tel" className={inputCls} value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 rounded accent-gold-500" />
                <span className="text-sm font-medium text-primary-800 dark:text-white/80">{tF("featuredLabel")}</span>
              </label>

              {/* Photo upload */}
              <div>
                <label className={labelCls}>{tF("photosLabel")}</label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-primary-200 p-4 text-sm text-primary-500 dark:border-white/15 hover:border-gold-400 transition">
                  <Upload className="h-5 w-5" />
                  {uploading ? tF("uploading") : tF("upload")}
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
                  {saving ? tF("creating") : tF("createPublish")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listings */}
      {dbListings.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
              {tF("allListings")}
            </h2>
            <span className="text-sm text-primary-400 dark:text-white/40">
              {(() => {
                const f = staffFilters;
                const n = dbListings.filter(l => {
                  if (f.district && l.district !== f.district) return false;
                  if (f.type && l.type !== f.type) return false;
                  if (f.purpose && l.purpose !== f.purpose) return false;
                  if (f.priceMin && l.price < Number(f.priceMin)) return false;
                  if (f.priceMax && l.price > Number(f.priceMax)) return false;
                  if (f.status && l.status !== f.status) return false;
                  return true;
                }).length;
                return `${n} / ${dbListings.length}`;
              })()}
            </span>
          </div>

          <StaffFilterBar
            filters={staffFilters}
            onChange={setStaffFilters}
            onReset={() => setStaffFilters(emptyStaffFilters)}
            showStatus
          />

          {(() => {
            const f = staffFilters;
            const filtered = dbListings.filter(l => {
              if (f.district && l.district !== f.district) return false;
              if (f.type && l.type !== f.type) return false;
              if (f.purpose && l.purpose !== f.purpose) return false;
              if (f.priceMin && l.price < Number(f.priceMin)) return false;
              if (f.priceMax && l.price > Number(f.priceMax)) return false;
              if (f.status && l.status !== f.status) return false;
              return true;
            });

            if (filtered.length === 0) {
              return (
                <p className="mt-10 text-center text-sm text-primary-500 dark:text-white/50">
                  No listings match your filters.
                </p>
              );
            }

            return (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((l) => (
                  <AdminListingCard
                    key={l.id}
                    listing={l}
                    locale={locale}
                    toggling={toggling === l.id}
                    updatingStatus={updatingStatus === l.id}
                    onPublishToggle={() => togglePublish(l)}
                    onStatusChange={(s) => changeStatus(l, s)}
                    onViewMatches={() => setMatchesFor(l.id)}
                  />
                ))}
              </div>
            );
          })()}
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
