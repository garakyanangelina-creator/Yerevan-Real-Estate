import "server-only";

import { cache } from "react";
import { ApifyConfigError, fetchLatestApifyItems } from "@/lib/apify";
import { districtCenters } from "@/lib/mock-data";
import {
  toPublicProperty,
  type District,
  type Property,
  type PropertyAmenities,
  type PropertyFetchErrorCode,
  type PropertyFetchResult,
  type PropertyType,
  type PublicProperty,
  type Purpose,
} from "@/types/property";

/**
 * Raw shape of a single Apify dataset item. Field names vary by actor, so most
 * fields accept a couple of common aliases — see the mapping functions below.
 */
interface RawApifyListing {
  id?: string | number;
  url?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number | string;
  currency?: string;
  district?: string;
  neighborhood?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lng?: number | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  area?: number | string;
  size?: number | string;
  floor?: number | string;
  totalFloors?: number | string;
  propertyType?: string;
  type?: string;
  listingType?: string;
  purpose?: string;
  images?: string[];
  photos?: string[];
  amenities?: string[] | Partial<PropertyAmenities>;
  contactPhone?: string;
  ownerPhone?: string;
  phone?: string;
  ownerName?: string;
  createdAt?: string;
  publishedAt?: string;
  scrapedAt?: string;
  popularity?: number | string;
  views?: number | string;
  featured?: boolean;
  /** Instagram-scraper shape (e.g. Instagram Post Scraper actors): the listing
   *  text lives in a free-form caption rather than structured fields. */
  caption?: string;
  timestamp?: string;
  likesCount?: number;
  ownerFullName?: string;
  ownerUsername?: string;
}

const TYPE_ALIASES: Record<string, PropertyType> = {
  apartment: "apartment",
  flat: "apartment",
  house: "house",
  cottage: "house",
  villa: "house",
  commercial: "commercial",
  retail: "commercial",
  shop: "commercial",
  office: "office",
  land: "land",
  plot: "land",
};

const PURPOSE_ALIASES: Record<string, Purpose> = {
  rent: "rent",
  rental: "rent",
  lease: "rent",
  forrent: "rent",
  sale: "sale",
  sell: "sale",
  buy: "sale",
  forsale: "sale",
};

const DISTRICT_ALIASES: Record<string, District> = {
  kentron: "kentron",
  center: "kentron",
  centre: "kentron",
  downtown: "kentron",
  arabkir: "arabkir",
  davtashen: "davtashen",
  ajapnyak: "ajapnyak",
  shengavit: "shengavit",
  "kanaker-zeytun": "kanakerZeytun",
  kanakerzeytun: "kanakerZeytun",
  kanaker: "kanakerZeytun",
  "nor nork": "norNork",
  nornork: "norNork",
  "malatia-sebastia": "malatiaSebastia",
  malatiasebastia: "malatiaSebastia",
  malatia: "malatiaSebastia",
  avan: "avan",
  erebuni: "erebuni",
  "nork-marash": "norkMarash",
  norkmarash: "norkMarash",
  nubarashen: "nubarashen",
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, "-");
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapPropertyType(value?: string): PropertyType {
  if (!value) return "apartment";
  return TYPE_ALIASES[normalizeKey(value)] ?? "apartment";
}

function mapPurpose(value?: string): Purpose {
  if (!value) return "sale";
  return PURPOSE_ALIASES[normalizeKey(value)] ?? "sale";
}

function mapDistrict(value?: string): District {
  if (!value) return "other";
  return DISTRICT_ALIASES[normalizeKey(value)] ?? "other";
}

function mapAmenities(raw: RawApifyListing): PropertyAmenities {
  const base: PropertyAmenities = {
    parking: false,
    balcony: false,
    furniture: false,
    petFriendly: false,
    newBuilding: false,
    elevator: false,
    ac: false,
    heating: false,
  };

  if (!raw.amenities) return base;

  if (Array.isArray(raw.amenities)) {
    const set = new Set(raw.amenities.map((a) => normalizeKey(String(a))));
    return {
      parking: set.has("parking"),
      balcony: set.has("balcony"),
      furniture: set.has("furniture") || set.has("furnished"),
      petFriendly: set.has("pet-friendly") || set.has("petfriendly") || set.has("pets-allowed"),
      newBuilding: set.has("new-building") || set.has("newbuilding") || set.has("new"),
      elevator: set.has("elevator"),
      ac: set.has("ac") || set.has("air-conditioning") || set.has("airconditioning"),
      heating: set.has("heating"),
    };
  }

  return { ...base, ...raw.amenities };
}

function mapImages(raw: RawApifyListing): string[] {
  if (raw.images?.length) return raw.images;
  if (raw.photos?.length) return raw.photos;
  return [];
}

/**
 * Best-effort extraction of structured listing details from a free-form
 * Armenian Instagram caption (this dataset is Instagram Post Scraper output
 * from @yerevanrealestate_, not a structured listings feed — there are no
 * dedicated price/area/district fields, just text like:
 * "📍Վաճառվում է ... Դավթաշեն համայնքում ... 35քմ ... 9/10 հարկ ... 320.000ՀՀ դրամ").
 * These regexes cover the patterns seen in that account's posts; tune them if
 * a different actor/account is connected later.
 */
const DISTRICT_PATTERNS_HY: Array<[RegExp, District]> = [
  [/Կենտրոն/i, "kentron"],
  [/Արաբկիր/i, "arabkir"],
  [/Դավթաշեն/i, "davtashen"],
  [/Աջափնյակ/i, "ajapnyak"],
  [/Շենգավիթ/i, "shengavit"],
  [/Քանաքեռ/i, "kanakerZeytun"],
  [/Նոր\s*Նորք/i, "norNork"],
  [/Մալաթիա/i, "malatiaSebastia"],
  [/Ավան/i, "avan"],
  [/Էրեբունի/i, "erebuni"],
  [/Նորք-?\s*Մարաշ/i, "norkMarash"],
  [/Նուբարաշեն/i, "nubarashen"],
];

function detectDistrictFromText(text: string): District {
  for (const [pattern, district] of DISTRICT_PATTERNS_HY) {
    if (pattern.test(text)) return district;
  }
  return "other";
}

function detectPurposeFromText(text: string): Purpose {
  if (/վարձ/i.test(text)) return "rent";
  return "sale";
}

function parsePriceFromText(text: string): { price: number; currency: string } | null {
  const match = text.match(/([\d][\d.,]{2,})\s*(ՀՀ\s*դրամ|դրամ|դոլար|usd|\$)/i);
  if (!match) return null;
  const price = Number(match[1].replace(/[.,]/g, ""));
  if (!Number.isFinite(price) || price <= 0) return null;
  const unit = match[2].toLowerCase();
  const currency = unit.includes("դոլար") || unit.includes("usd") || unit.includes("$") ? "USD" : "AMD";
  return { price, currency };
}

function parseAreaFromText(text: string): number | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:քառ\.?\s*մ|քմ)/i);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function parseFloorFromText(text: string): { floor: number; totalFloors: number } | null {
  const match = text.match(/(\d+)\s*\/\s*(\d+)\s*հարկ/);
  return match ? { floor: Number(match[1]), totalFloors: Number(match[2]) } : null;
}

/** "N սենյականոց" (N-room) is used colloquially close to a bedroom count. */
function parseBedroomsFromText(text: string): number | null {
  const match = text.match(/(\d+)\s*սենյականոց/i);
  return match ? Number(match[1]) : null;
}

function parseAddressFromText(text: string): string {
  const match = text.match(/([Ա-ֆ][Ա-ֆ\s]{1,40})\s+փողոցում/u);
  return match ? match[1].trim() : "";
}

function deriveTitleFromCaption(caption: string): string {
  const firstLine = caption.split("\n")[0]?.replace(/^[^\p{L}\d]+/u, "").trim();
  return firstLine ? firstLine.slice(0, 100) : "Untitled listing";
}

/** Converts one raw Apify dataset item into our internal Property model. */
export function mapApifyListingToProperty(raw: RawApifyListing, index: number): Property {
  const caption = raw.caption?.trim() ?? "";

  const parsedPrice = caption ? parsePriceFromText(caption) : null;
  const parsedArea = caption ? parseAreaFromText(caption) : null;
  const parsedFloor = caption ? parseFloorFromText(caption) : null;
  const parsedBedrooms = caption ? parseBedroomsFromText(caption) : null;
  const parsedAddress = caption ? parseAddressFromText(caption) : "";

  const explicitDistrict = mapDistrict(raw.district ?? raw.neighborhood);
  const district = explicitDistrict !== "other" ? explicitDistrict : detectDistrictFromText(caption);
  const fallbackCoords = districtCenters[district];

  return {
    id: String(raw.id ?? raw.url ?? `apify-${index}`),
    title: raw.title?.trim() || raw.name?.trim() || (caption ? deriveTitleFromCaption(caption) : "Untitled listing"),
    description: raw.description?.trim() || caption,
    type: mapPropertyType(raw.propertyType ?? raw.type),
    purpose: raw.listingType ?? raw.purpose ? mapPurpose(raw.listingType ?? raw.purpose) : detectPurposeFromText(caption),
    district,
    address: raw.address?.trim() || parsedAddress,
    price: raw.price !== undefined ? toNumber(raw.price) : parsedPrice?.price ?? 0,
    currency: raw.currency?.trim() || parsedPrice?.currency || "AMD",
    bedrooms: raw.bedrooms !== undefined ? toNumber(raw.bedrooms) : parsedBedrooms ?? 0,
    bathrooms: toNumber(raw.bathrooms),
    area: (raw.area ?? raw.size) !== undefined ? toNumber(raw.area ?? raw.size) : parsedArea ?? 0,
    floor: raw.floor !== undefined ? toNumber(raw.floor) : parsedFloor?.floor ?? 0,
    totalFloors: raw.totalFloors !== undefined ? toNumber(raw.totalFloors) : parsedFloor?.totalFloors ?? 0,
    images: mapImages(raw),
    amenities: mapAmenities(raw),
    featured: Boolean(raw.featured),
    popularity: toNumber(raw.popularity ?? raw.views ?? raw.likesCount),
    createdAt: raw.createdAt ?? raw.publishedAt ?? raw.scrapedAt ?? raw.timestamp ?? new Date().toISOString(),
    lat: toNumber(raw.latitude ?? raw.lat, fallbackCoords.lat),
    lng: toNumber(raw.longitude ?? raw.lng, fallbackCoords.lng),
    // Private fields — only ever read via getAdminProperties(), never toPublicProperty().
    // This Instagram dataset has no individual owner phone numbers (it's the
    // agency's own account), so these are typically empty — which is fine,
    // the UI already falls back to "Contact Agency" / WhatsApp when empty.
    ownerPhone: raw.contactPhone ?? raw.ownerPhone ?? raw.phone ?? "",
    ownerName: raw.ownerName ?? raw.ownerFullName ?? "",
  };
}

function toFetchErrorCode(error: unknown): PropertyFetchErrorCode {
  if (error instanceof ApifyConfigError) return "config";
  return "network";
}

/**
 * Fetches and maps the full live listing set once per request (memoized via
 * React's `cache`), on top of the Next.js fetch-level cache in lib/apify.ts.
 * Never throws — callers get an explicit error code instead so pages can show
 * a translated, friendly message rather than mock data.
 */
export const getApifyProperties = cache(async (): Promise<PropertyFetchResult<Property>> => {
  try {
    const items = await fetchLatestApifyItems<RawApifyListing>({ revalidateSeconds: 300 });
    return { properties: items.map(mapApifyListingToProperty), error: null };
  } catch (error) {
    console.error("[propertyService] Failed to load properties from Apify:", error);
    return { properties: [], error: toFetchErrorCode(error) };
  }
});

function toPublicResult(result: PropertyFetchResult<Property>): PropertyFetchResult<PublicProperty> {
  return { properties: result.properties.map(toPublicProperty), error: result.error };
}

type DbPropertyRow = {
  id: string; title: string; description: string | null; type: string; purpose: string;
  district: string; address: string | null; price: number; currency: string;
  bedrooms: number; bathrooms: number; area: number; floor: number; totalFloors: number;
  images: string; amenities: string; featured: boolean; createdAt: Date;
  listingCode?: number | null;
};

function mapDbRow(r: DbPropertyRow): PublicProperty {
  const amenities = (() => { try { return JSON.parse(r.amenities); } catch { return {}; } })();
  const images = (() => { try { return JSON.parse(r.images); } catch { return []; } })();
  const coords = districtCenters[r.district as District] ?? districtCenters.other;
  return {
    id: r.id,
    listingCode: r.listingCode ?? undefined,
    title: r.title,
    description: r.description ?? "",
    type: r.type as PublicProperty["type"],
    purpose: r.purpose as PublicProperty["purpose"],
    district: r.district as District,
    address: r.address ?? "",
    price: r.price,
    currency: r.currency,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    area: r.area,
    floor: r.floor,
    totalFloors: r.totalFloors,
    images,
    amenities: {
      parking: Boolean(amenities.parking),
      balcony: Boolean(amenities.balcony || amenities.openBalcony || amenities.closedBalcony),
      furniture: Boolean(amenities.furniture),
      petFriendly: Boolean(amenities.petFriendly),
      newBuilding: Boolean(amenities.newBuilding || amenities.buildingType === "newBuilding"),
      elevator: Boolean(amenities.elevator),
      ac: Boolean(amenities.ac),
      heating: Boolean(amenities.heating),
    },
    featured: r.featured,
    popularity: 0,
    createdAt: r.createdAt.toISOString(),
    lat: coords.lat,
    lng: coords.lng,
  };
}

async function getDbPublicProperties(): Promise<PublicProperty[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.dbProperty.findMany({
      where: { isPublished: true, status: { in: ["active", "available"] } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => mapDbRow(r as DbPropertyRow));
  } catch {
    return [];
  }
}

export async function getPublicPropertyByCode(
  code: string
): Promise<{ property: PublicProperty | null; error: PropertyFetchErrorCode }> {
  const numericCode = parseInt(code, 10);
  if (isNaN(numericCode)) return { property: null, error: null };
  try {
    const { prisma } = await import("@/lib/prisma");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = await (prisma.dbProperty as any).findFirst({
      where: { listingCode: numericCode, isPublished: true },
    });
    return { property: row ? mapDbRow(row as DbPropertyRow) : null, error: null };
  } catch {
    return { property: null, error: "network" };
  }
}

export async function getPublicProperties(): Promise<PropertyFetchResult<PublicProperty>> {
  const [apify, db] = await Promise.all([
    toPublicResult(await getApifyProperties()),
    getDbPublicProperties(),
  ]);
  return { properties: [...db, ...apify.properties], error: apify.error };
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyFetchResult<PublicProperty>> {
  const { properties, error } = await getPublicProperties();
  return { properties: properties.filter((p) => p.featured).slice(0, limit), error };
}

export async function getLatestProperties(limit = 6): Promise<PropertyFetchResult<PublicProperty>> {
  const { properties, error } = await getPublicProperties();
  const sorted = [...properties].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return { properties: sorted.slice(0, limit), error };
}

export async function getPublicPropertyById(
  id: string
): Promise<{ property: PublicProperty | null; error: PropertyFetchErrorCode }> {
  const { properties, error } = await getPublicProperties();
  return { property: properties.find((p) => p.id === id) ?? null, error };
}

export async function getSimilarPublicProperties(
  property: PublicProperty,
  limit = 3
): Promise<PublicProperty[]> {
  const { properties } = await getPublicProperties();
  const sameDistrict = properties.filter((p) => p.id !== property.id && p.district === property.district);
  const sameType = properties.filter((p) => p.id !== property.id && p.type === property.type);
  const merged = [...sameDistrict, ...sameType].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );
  return merged.slice(0, limit);
}

/**
 * Includes private owner contact fields (ownerName/ownerPhone). Only call this
 * from server code that has already verified an authenticated admin session
 * (see src/lib/adminAuth.ts) — never expose its result through a public route.
 */
export async function getAdminProperties(): Promise<PropertyFetchResult<Property>> {
  return getApifyProperties();
}
