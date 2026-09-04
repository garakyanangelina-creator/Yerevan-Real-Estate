import { NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isStreetInDistrict } from "@/lib/yerevan-streets";
import { writeAuditLog, getIp } from "@/lib/audit";
import {
  ALLOWED_TYPES,
  ALLOWED_PURPOSES,
  ALLOWED_DISTRICTS,
  ALLOWED_CURRENCIES,
  sanitizeImageUrls,
} from "@/lib/listingValidation";

export async function GET() {
  await ensureDatabase();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admins/super_admins see all; employees see only their own
  const where =
    session.role === "employee" ? { createdById: session.userId } : {};

  const listings = await prisma.dbProperty.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { username: true } } },
  });
  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  await ensureDatabase();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (title.length > 300) return NextResponse.json({ error: "title too long" }, { status: 400 });

  // Enum validation
  const type = typeof body?.type === "string" ? body.type : "apartment";
  const purpose = typeof body?.purpose === "string" ? body.purpose : "sale";
  const district = typeof body?.district === "string" ? body.district : "other";
  const currency = typeof body?.currency === "string" ? body.currency : "AMD";

  if (!ALLOWED_TYPES.has(type)) return NextResponse.json({ error: "Invalid property type" }, { status: 400 });
  if (!ALLOWED_PURPOSES.has(purpose)) return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
  if (!ALLOWED_DISTRICTS.has(district)) return NextResponse.json({ error: "Invalid district" }, { status: 400 });
  if (!ALLOWED_CURRENCIES.has(currency)) return NextResponse.json({ error: "Invalid currency" }, { status: 400 });

  const street = body?.amenities?.street ?? "";
  if (street && district && !isStreetInDistrict(district, street)) {
    return NextResponse.json(
      { error: "Street does not belong to the selected district." },
      { status: 422 }
    );
  }

  const isAdmin = session.role !== "employee";

  const listing = await prisma.$transaction(async (tx) => {
    const [{ max }] = await tx.$queryRaw<[{ max: number | null }]>`
      SELECT MAX("listingCode") as max FROM "DbProperty"
    `;
    const nextCode = (max ?? 500) + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (tx.dbProperty as any).create({
      data: {
        listingCode: nextCode,
        title,
        description: body?.description ? String(body.description).trim().slice(0, 5000) : null,
        type,
        purpose,
        district,
        address: body?.address ? String(body.address).trim().slice(0, 500) : null,
        price: Number(body?.price) || 0,
        currency,
        bedrooms: Math.max(0, Math.min(20, Number(body?.bedrooms) || 0)),
        bathrooms: Math.max(0, Math.min(20, Number(body?.bathrooms) || 0)),
        area: Math.max(0, Number(body?.area) || 0),
        floor: Math.max(0, Math.min(200, Number(body?.floor) || 0)),
        totalFloors: Math.max(0, Math.min(200, Number(body?.totalFloors) || 0)),
        images: JSON.stringify(sanitizeImageUrls(body?.images)),
        amenities: JSON.stringify(body?.amenities ?? {}),
        status: "active",
        isPublished: true,
        featured: isAdmin ? Boolean(body?.featured) : false,
        createdById: session.userId,
      },
    });
  });
  await writeAuditLog({ session, action: "listing.create", target: title, targetId: listing.id, ip: getIp(request) });
  return NextResponse.json({ listing }, { status: 201 });
}
