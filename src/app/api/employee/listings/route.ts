import { NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isStreetInDistrict } from "@/lib/yerevan-streets";

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
  if (!body?.title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const street = body.amenities?.street ?? "";
  const district = body.district ?? "";
  if (street && district && !isStreetInDistrict(district, street)) {
    return NextResponse.json(
      { error: "Street does not belong to the selected district." },
      { status: 422 }
    );
  }

  const isAdmin = session.role !== "employee";

  const listing = await prisma.$transaction(async (tx) => {
    // Use raw query to safely get MAX listingCode — avoids TS errors before client regen
    const [{ max }] = await tx.$queryRaw<[{ max: number | null }]>`
      SELECT MAX("listingCode") as max FROM "DbProperty"
    `;
    const nextCode = (max ?? 500) + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (tx.dbProperty as any).create({
      data: {
        listingCode: nextCode,
        title: String(body.title).trim(),
        description: body.description ? String(body.description).trim() : null,
        type: body.type ?? "apartment",
        purpose: body.purpose ?? "sale",
        district: body.district ?? "other",
        address: body.address ? String(body.address).trim() : null,
        price: Number(body.price) || 0,
        currency: body.currency ?? "AMD",
        bedrooms: Number(body.bedrooms) || 0,
        bathrooms: Number(body.bathrooms) || 0,
        area: Number(body.area) || 0,
        floor: Number(body.floor) || 0,
        totalFloors: Number(body.totalFloors) || 0,
        images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
        amenities: JSON.stringify(body.amenities ?? {}),
        status: "active",
        isPublished: true,
        featured: isAdmin ? Boolean(body.featured) : false,
        createdById: session.userId,
      },
    });
  });
  return NextResponse.json({ listing }, { status: 201 });
}
