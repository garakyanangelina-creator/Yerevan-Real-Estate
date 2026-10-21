"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import {
  BedDouble, Bath, Ruler, Building2, MapPin, Phone, User,
  Lock, Home, ArrowLeft, Pencil, Trash2, Eye, EyeOff, Link2, Check,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import Gallery from "@/components/property/Gallery";

export interface StaffListing {
  id: string;
  title: string;
  titleEn?: string | null;
  titleRu?: string | null;
  titleHy?: string | null;
  description: string | null;
  descriptionEn?: string | null;
  descriptionRu?: string | null;
  descriptionHy?: string | null;
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
  const t = useTranslations("staffView");
  const tTypes = useTranslations("propertyTypes");
  const tDistricts = useTranslations("districts");
  const tPurpose = useTranslations("purpose");
  const tStatus = useTranslations("status");
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(listing.isPublished);

  const displayCode = listing.listingCode
    ? String(listing.listingCode).padStart(4, "0")
    : null;

  const localeTitle =
    (locale === "ru" && listing.titleRu) ||
    (locale === "en" && listing.titleEn) ||
    (locale === "hy" && listing.titleHy) ||
    listing.title;

  const localeDesc =
    (locale === "ru" && listing.descriptionRu) ||
    (locale === "en" && listing.descriptionEn) ||
    (locale === "hy" && listing.descriptionHy) ||
    listing.description;

  const a = listing.amenities;
  const ownerName   = String(a.ownerName   ?? "").trim();
  const ownerPhone  = String(a.ownerPhone  ?? "").trim();
  const street      = String(a.street      ?? "").trim();
  const buildingNum = String(a.buildingNumber ?? "").trim();
  const fullAddress = [street, buildingNum].filter(Boolean).join(", ") || listing.address || "";
  const rooms       = a.rooms ? String(a.rooms) : null;
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

  const bedsLabel = listing.bedrooms === 0
    ? t("studio")
    : `${listing.bedrooms} ${listing.bedrooms === 1 ? t("beds") : t("bedsPlural")}`;

  const bathsLabel = `${listing.bathrooms} ${listing.bathrooms === 1 ? t("baths") : t("bathsPlural")}`;

  return (
    <div className="container-page py-8">
      {/* Top nav */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push(backHref as "/")}
          className="flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-900 dark:text-white/60 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t("backToListings")}
        </button>
        <div className="flex flex-wrap items-center gap-2">
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
              {isPublished
                ? <><Eye className="h-3.5 w-3.5" /> {t("published")}</>
                : <><EyeOff className="h-3.5 w-3.5" /> {t("draft")}</>}
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit}
              className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 hover:border-gold-400 hover:text-gold-600 dark:border-white/15 dark:bg-transparent dark:text-white/80 dark:hover:border-gold-400">
              <Pencil className="h-3.5 w-3.5" /> {t("edit")}
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800/40 dark:bg-transparent dark:text-red-400">
              <Trash2 className="h-3.5 w-3.5" /> {t("delete")}
            </button>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      {listing.images.length > 0 ? (
        <Gallery images={listing.images} title={localeTitle} />
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
                {tStatus(listing.status as Parameters<typeof tStatus>[0])}
              </span>
              {listing.featured && (
                <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-gold-700 dark:bg-gold-900/30 dark:text-gold-400">
                  {t("featured")}
                </span>
              )}
              {!isPublished && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {t("unpublished")}
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
              {localeTitle}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-primary-500 dark:text-white/60">
              <MapPin className="h-4 w-4" />
              {tDistricts(listing.district as Parameters<typeof tDistricts>[0])}, {t("yerevan")}
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 rounded-xl bg-primary-50 p-5 text-sm text-primary-700 dark:bg-primary-800/40 dark:text-white/80">
            <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-gold-500" />{bedsLabel}</span>
            <span className="flex items-center gap-2"><Bath className="h-4 w-4 text-gold-500" />{bathsLabel}</span>
            <span className="flex items-center gap-2"><Ruler className="h-4 w-4 text-gold-500" />{listing.area} m²</span>
            {listing.floor > 0 && (
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gold-500" />
                {t("floor")} {listing.floor}/{listing.totalFloors}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gold-500" />
              {tTypes(listing.type as Parameters<typeof tTypes>[0])}
            </span>
          </div>

          {/* Description */}
          {localeDesc && (
            <section>
              <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">{t("description")}</h2>
              <p className="mt-3 leading-relaxed text-primary-600 dark:text-white/70">{localeDesc}</p>
            </section>
          )}

          {/* Extra details */}
          {(rooms || buildingType || openBalcony > 0 || closedBal > 0 || ceilingH || view) && (
            <section>
              <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">{t("details")}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3">
                {rooms       && <><dt className="text-primary-400">{t("rooms")}</dt><dd className="font-medium text-primary-800 dark:text-white">{rooms}</dd></>}
                {buildingType && <><dt className="text-primary-400">{t("building")}</dt><dd className="font-medium text-primary-800 dark:text-white capitalize">{buildingType}</dd></>}
                {openBalcony > 0 && <><dt className="text-primary-400">{t("openBalcony")}</dt><dd className="font-medium text-primary-800 dark:text-white">{openBalcony}</dd></>}
                {closedBal > 0   && <><dt className="text-primary-400">{t("closedBalcony")}</dt><dd className="font-medium text-primary-800 dark:text-white">{closedBal}</dd></>}
                {ceilingH    && <><dt className="text-primary-400">{t("ceiling")}</dt><dd className="font-medium text-primary-800 dark:text-white">{ceilingH} m</dd></>}
                {view        && <><dt className="text-primary-400">{t("view")}</dt><dd className="font-medium text-primary-800 dark:text-white capitalize">{view}</dd></>}
              </dl>
            </section>
          )}

          {/* INTERNAL INFORMATION */}
          <section className="rounded-2xl border-2 border-amber-300/60 bg-amber-50 p-6 dark:border-amber-700/40 dark:bg-amber-900/10">
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h2 className="font-serif text-lg font-semibold text-amber-800 dark:text-amber-300">
                {t("internalInfo")}
              </h2>
            </div>
            {hasPrivateInfo ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {ownerName && (
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">{t("owner")}</dt>
                      <dd className="font-medium text-primary-900 dark:text-white">{ownerName}</dd>
                    </div>
                  </div>
                )}
                {ownerPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">{t("phone")}</dt>
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
                      <dt className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">{t("exactAddress")}</dt>
                      <dd className="font-medium text-primary-900 dark:text-white">
                        {fullAddress}, {tDistricts(listing.district as Parameters<typeof tDistricts>[0])}, {t("yerevan")}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-amber-700/60 dark:text-amber-400/50">{t("noPrivateInfo")}</p>
            )}

            <div className="mt-4 border-t border-amber-200/60 pt-4 dark:border-amber-700/30">
              <p className="text-xs text-amber-600/70 dark:text-amber-400/50">
                {t("createdBy")} <strong>{listing.createdBy.username}</strong>
                {t("on") ? ` ${t("on")} ` : " "}
                {new Date(listing.createdAt).toLocaleDateString()}
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-3xl font-bold text-gold-600">
              {formatPrice(listing.price, listing.purpose as "sale" | "rent", listing.currency)}
            </p>
            <p className="mt-1 text-sm capitalize text-primary-500 dark:text-white/60">
              {t("forPurpose") ? `${t("forPurpose")} ` : ""}{tPurpose(listing.purpose as "sale" | "rent")} · {tTypes(listing.type as Parameters<typeof tTypes>[0])}
            </p>
          </div>

          {displayCode ? (
            <div className="card p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-white/40">
                {t("shareWithClient")}
              </p>
              <button
                onClick={copyLink}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  copied
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gold-500 text-primary-900 hover:bg-gold-400"
                }`}
              >
                {copied
                  ? <><Check className="h-4 w-4" /> {t("linkCopied")}</>
                  : <><Link2 className="h-4 w-4" /> {t("copyLink")}</>}
              </button>
              <p className="mt-2 text-center text-xs text-primary-400 dark:text-white/30">
                {t("clientSeesPublic")}
              </p>
              <p className="mt-1 text-center font-mono text-xs text-primary-300 dark:text-white/20">
                /listing/{displayCode}
              </p>
            </div>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-xs text-primary-400">{t("noListingCode")}</p>
            </div>
          )}

          {(ownerName || ownerPhone) && (
            <div className="card border border-amber-200/60 bg-amber-50 p-5 dark:border-amber-700/40 dark:bg-amber-900/10">
              <div className="mb-3 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">{t("ownerContact")}</p>
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
