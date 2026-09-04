import "server-only";

import { districtCenters } from "@/lib/mock-data";
import {
  type District,
  type Property,
  type PropertyAmenities,
  type PropertyFetchErrorCode,
  type PropertyFetchResult,
  type PropertyType,
  type PublicProperty,
  type Purpose,
} from "@/types/property";

// ── DB row helpers ────────────────────────────────────────────────────────────

type DbPropertyRow = {
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
  featured: boolean;
  createdAt: Date;
  listingCode?: number | null;
};

function parseAmenities(raw: string): PropertyAmenities {
  const a = (() => { try { return JSON.parse(raw); } catch { return {}; } })();
  return {
    parking: Boolean(a.parking),
    balcony: Boolean(a.balcony || a.openBalcony || a.closedBalcony),
    furniture: Boolean(a.furniture),
    petFriendly: Boolean(a.petFriendly),
    newBuilding: Boolean(a.newBuilding || a.buildingType === "newBuilding"),
    elevator: Boolean(a.elevator),
    ac: Boolean(a.ac),
    heating: Boolean(a.heating),
  };
}

function mapDbRowToPublic(r: DbPropertyRow): PublicProperty {
  const images = (() => { try { return JSON.parse(r.images); } catch { return []; } })();
  const coords = districtCenters[r.district as District] ?? districtCenters.other;
  return {
    id: r.id,
    listingCode: r.listingCode ?? undefined,
    title: r.title,
    description: r.description ?? "",
    type: r.type as PropertyType,
    purpose: r.purpose as Purpose,
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
    amenities: parseAmenities(r.amenities),
    featured: r.featured,
    popularity: 0,
    createdAt: r.createdAt.toISOString(),
    lat: coords.lat,
    lng: coords.lng,
  };
}

function mapDbRowToProperty(r: DbPropertyRow): Property {
  return {
    ...mapDbRowToPublic(r),
    ownerPhone: "",
    ownerName: "",
  };
}

// ── Public queries ────────────────────────────────────────────────────────────

async function getPublishedRows(): Promise<DbPropertyRow[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.dbProperty.findMany({
      where: { isPublished: true, status: { in: ["active", "available"] } },
      orderBy: { createdAt: "desc" },
    }) as unknown as DbPropertyRow[];
  } catch {
    return [];
  }
}

export async function getPublicProperties(): Promise<PropertyFetchResult<PublicProperty>> {
  const rows = await getPublishedRows();
  return { properties: rows.map(mapDbRowToPublic), error: null };
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyFetchResult<PublicProperty>> {
  const rows = await getPublishedRows();
  const featured = rows.filter((r) => r.featured);
  // Fall back to latest published listings when none are marked featured
  const source = featured.length > 0 ? featured : rows;
  return { properties: source.slice(0, limit).map(mapDbRowToPublic), error: null };
}

export async function getLatestProperties(limit = 6): Promise<PropertyFetchResult<PublicProperty>> {
  const rows = await getPublishedRows();
  return { properties: rows.slice(0, limit).map(mapDbRowToPublic), error: null };
}

export async function getPublicPropertyById(
  id: string
): Promise<{ property: PublicProperty | null; error: PropertyFetchErrorCode }> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.dbProperty.findFirst({
      where: { id, isPublished: true },
    });
    return { property: row ? mapDbRowToPublic(row as unknown as DbPropertyRow) : null, error: null };
  } catch {
    return { property: null, error: "network" };
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
    return { property: row ? mapDbRowToPublic(row as DbPropertyRow) : null, error: null };
  } catch {
    return { property: null, error: "network" };
  }
}

export async function getSimilarPublicProperties(
  property: PublicProperty,
  limit = 3
): Promise<PublicProperty[]> {
  const rows = await getPublishedRows();
  const others = rows.filter((r) => r.id !== property.id);
  const sameDistrict = others.filter((r) => r.district === property.district);
  const sameType = others.filter((r) => r.type === property.type);
  const merged = [...sameDistrict, ...sameType].filter(
    (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
  );
  return merged.slice(0, limit).map(mapDbRowToPublic);
}

/**
 * Returns all DB listings for admin views (includes private owner fields as empty strings
 * since the DB schema stores agent info via createdBy relation, not ownerPhone/ownerName).
 * Only call from authenticated admin server code.
 */
export async function getAdminProperties(): Promise<PropertyFetchResult<Property>> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.dbProperty.findMany({
      orderBy: { createdAt: "desc" },
    }) as unknown as DbPropertyRow[];
    return { properties: rows.map(mapDbRowToProperty), error: null };
  } catch {
    return { properties: [], error: "network" };
  }
}
