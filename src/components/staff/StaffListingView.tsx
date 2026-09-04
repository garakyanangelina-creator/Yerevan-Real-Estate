"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import {
  BedDouble, Bath, Ruler, Building2, MapPin, Phone, User,
  Lock, Home, ArrowLeft, Pencil, Trash2, Eye, EyeOff, Link2, Check,
} from "lucide-react";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/utils";
import Gallery from "@/components/property/Gallery";

export interface StaffListing {
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
  images: string[];
  amenities: Record<string, unknown>;
  status: string;
  isPublished: boolean;
  listingCode: number | null;
  featured: boolean;
  createdAt: string;
  createdBy: { username: string };
}

interface Props {
  listing: StaffListing;
  backHref: string;
  onEdit?: () => void;
  onDelete?: () => void;
  role: string;
}

const DISTRICT_LABELS: Record<string, string> = {
  kentron: "Kentron", arabkir: "Arabkir", davtashen: "Davtashen",
  ajapnyak: "Ajapnyak", shengavit: "Shengavit", kanakerZeytun: "Kanaker-Zeytun",
  norNork: "Nor Nork", malatiaSebastia: "Malatia-Sebastia", avan: "Avan",
  erebuni: "Erebuni", norkMarash: "Nork-Marash", nubarashen: "Nubarashen", other: "Other",
};

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment", house: "House", commercial: "Commercial",
  office: "Office", land: "Land",
};

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-700",
  available: "bg-green-100 text-green-700",
  sold:      "bg-gray-100 text-gray-600",
  rented:    "bg-blue-100 text-blue-700",
  archived:  "bg-red-100 text-red-700",
};

export default function StaffListingView({ listing, backHref, onEdit, onDelete, role }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(listing.isPublished);

  const displayCode = listing.listingCode
    ? String(listing.listingCode).padStart(4, "0")
    : null;

  const a = listing.amenities;
  const ownerName   = String(a.ownerName   ?? "").trim();
  const ownerPhone  = String(a.ownerPhone  ?? "").trim();
  const street      = String(a.street      ?? "").trim();
  const buildingNum = String(a.buildingNumber ?? "").trim();
  const fullAddress = [street, buildingNum].filter(Boolean).join(", ") || listing.address || "";
  const rooms       = a.rooms       ? `${a.rooms} rooms`      : null;
  const buildingType= String(a.buildingType ?? "").trim();
  const openBalcony = Number(a.openBalcony  ?? 0);
  const closedBal   = Number(a.closedBalcony ?? 0);
  const ceilingH    = String(a.ceilingHeight ?? "").trim();
  const view        = String(a.view         ?? "").trim();

  const hasPrivateInfo = ownerName || ownerPhone || fullAddress;

  async function copyLink() {
    if (!displayCode) return;
    const url = `${window.location.origin}/${locale}/listing/${displayCode}`;
    try { await navigator.clipboard.writeText(url); }
    catch {
      const el = document.createElement("textarea");
      el.value = url; el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function togglePublish() {
    setPublishing(true);
    await fetch(`/api/employee/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    setIsPublished((v) => !v);
    setPublishing(false);
  }

  return (
    <div className="container-page py-8">
      {/* Top nav */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push(backHref as "/")}
          className="flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-900 dark:text-white/60 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {/* Publish toggle — admins only */}
          {(role === "admin" || role === "super_admin") && (
            <button
              onClick={togglePublish}
              disabled={publishing}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                isPublished
                  ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                  : "bg-primary-100 text-primary-600 hover:bg-gold-100 hover:text-gold-700"
              }`}
            >
              {isPublished ? <><Eye className="h-3.5 w-3.5" /> Published</> : <><EyeOff className="h-3.5 w-3.5" /> Draft</>}
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit}
              className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 hover:border-gold-400 hover:text-gold-600 dark:border-white/15 dark:bg-transparent dark:text-white/80 dark:hover:border-gold-400">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800/40 dark:bg-transparent dark:text-red-400">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      {listing.images.length > 0 ? (
        <Gallery images={listing.images} title={listing.title} />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-800/30">
          <Building2 className="h-16 w-16 text-primary-200" />
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {displayCode && (
                <span className="rounded bg-primary-50 px-2 py-0.5 font-mono text-xs font-bold text-primary-500 dark:bg-white/10 dark:text-white/60">
                  #{displayCode}
                </span>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[listing.status] ?? STATUS_COLORS.available}`}>
                {listing.status}
              </span>
              {listing.featured && (
                <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-gold-700 dark:bg-gold-900/30 dark:text-gold-400">
                  Featured
                </span>
              )}
              {!isPublished && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  Unpublished
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
              {listing.title}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-primary-500 dark:text-white/60">
              <MapPin className="h-4 w-4" />
              {DISTRICT_LABELS[listing.district] ?? listing.district}, Yerevan
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 rounded-xl bg-primary-50 p-5 text-sm text-primary-700 dark:bg-primary-800/40 dark:text-white/80">
            <span className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-gold-500" />
              {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed${listing.bedrooms !== 1 ? "s" : ""}`}
            </span>
            <span className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-gold-500" />
              {listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-gold-500" />
              {listing.area} m²
            </span>
            {listing.floor > 0 && (
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gold-500" />
                Floor {listing.floor}/{listing.totalFloors}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gold-500" />
              {TYPE_LABELS[listing.type] ?? listing.type}
            </span>
          </div>

          {/* Description */}
          {listing.description && (
            <section>
              <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">Description</h2>
              <p className="mt-3 leading-relaxed text-primary-600 dark:text-white/70">{listing.description}</p>
            </section>
          )}

          {/* Extra details */}
          {(rooms || buildingType || openBalcony > 0 || closedBal > 0 || ceilingH || view) && (
            <section>
              <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">Details</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3">
                {rooms       && <><dt className="text-primary-400">Rooms</dt><dd className="font-medium text-primary-800 dark:text-white">{rooms}</dd></>}
                {buildingType && <><dt className="text-primary-400">Building</dt><dd className="font-medium text-primary-800 dark:text-white capitalize">{buildingType}</dd></>}
                {openBalcony > 0 && <><dt className="text-primary-400">Open Balcony</dt><dd className="font-medium text-primary-800 dark:text-white">{openBalcony}</dd></>}
                {closedBal > 0   && <><dt className="text-primary-400">Closed Balcony</dt><dd className="font-medium text-primary-800 dark:text-white">{closedBal}</dd></>}
                {ceilingH    && <><dt className="text-primary-400">Ceiling</dt><dd className="font-medium text-primary-800 dark:text-white">{ceilingH} m</dd></>}
                {view        && <><dt className="text-primary-400">View</dt><dd className="font-medium text-primary-800 dark:text-white capitalize">{view}</dd></>}
              </dl>
            </section>
          )}

          {/* ── INTERNAL INFORMATION ─────────────────────────────── */}
          <section className="rounded-2xl border-2 border-amber-300/60 bg-amber-50 p-6 dark:border-amber-700/40 dark:bg-amber-900/10">
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h2 className="font-serif text-lg font-semibold text-amber-800 dark:text-amber-300">
                Internal Information — Staff Only
              </h2>
            </div>
            {hasPrivateInfo ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {ownerName && (
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Owner</dt>
                      <dd className="font-medium text-primary-900 dark:text-white">{ownerName}</dd>
                    </div>
                  </div>
                )}
                {ownerPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Phone</dt>
                      <dd>
                        <a href={`tel:${ownerPhone}`} className="font-medium text-primary-900 hover:text-gold-600 dark:text-white dark:hover:text-gold-400">
                          {ownerPhone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {fullAddress && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Exact Address</dt>
                      <dd className="font-medium text-primary-900 dark:text-white">{fullAddress}, {DISTRICT_LABELS[listing.district] ?? listing.district}, Yerevan</dd>
                    </div>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-amber-700/60 dark:text-amber-400/50">No private information stored for this listing.</p>
            )}

            {/* Created by */}
            <div className="mt-4 border-t border-amber-200/60 pt-4 dark:border-amber-700/30">
              <p className="text-xs text-amber-600/70 dark:text-amber-400/50">
                Created by <strong>{listing.createdBy.username}</strong> on {new Date(listing.createdAt).toLocaleDateString()}
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Price card */}
          <div className="card p-5">
            <p className="text-3xl font-bold text-gold-600">
              {formatPrice(listing.price, listing.purpose as "sale" | "rent", listing.currency)}
            </p>
            <p className="mt-1 text-sm capitalize text-primary-500 dark:text-white/60">
              For {listing.purpose} · {TYPE_LABELS[listing.type] ?? listing.type}
            </p>
          </div>

          {/* Copy Link — primary CTA for employees */}
          {displayCode ? (
            <div className="card p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-white/40">
                Share with client
              </p>
              <button
                onClick={copyLink}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  copied
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gold-500 text-primary-900 hover:bg-gold-400"
                }`}
              >
                {copied ? (
                  <><Check className="h-4 w-4" /> Link copied! Send to client</>
                ) : (
                  <><Link2 className="h-4 w-4" /> Copy public link</>
                )}
              </button>
              <p className="mt-2 text-center text-xs text-primary-400 dark:text-white/30">
                Client sees public version only — no private info
              </p>
              {displayCode && (
                <p className="mt-1 text-center font-mono text-xs text-primary-300 dark:text-white/20">
                  /listing/{displayCode}
                </p>
              )}
            </div>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-xs text-primary-400">Listing code not yet assigned — re-save to generate.</p>
            </div>
          )}

          {/* Quick owner contacts in sidebar */}
          {(ownerName || ownerPhone) && (
            <div className="card border border-amber-200/60 bg-amber-50 p-5 dark:border-amber-700/40 dark:bg-amber-900/10">
              <div className="mb-3 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Owner contact</p>
              </div>
              {ownerName  && <p className="text-sm font-medium text-primary-900 dark:text-white">{ownerName}</p>}
              {ownerPhone && (
                <a href={`tel:${ownerPhone}`} className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:text-gold-500">
                  <Phone className="h-3.5 w-3.5" /> {ownerPhone}
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
