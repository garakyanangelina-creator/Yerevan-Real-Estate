import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isStreetInDistrict } from "@/lib/yerevan-streets";

const MAX_STR = 500;
const MAX_MSG = 10000;
const MAX_PHOTOS = 20;

function str(v: unknown, max = MAX_STR): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function safePhotoUrl(u: unknown): string | null {
  if (typeof u !== "string") return null;
  try {
    const parsed = new URL(u.trim());
    if (parsed.protocol !== "https:") return null;
    if (u.length > 2000) return null;
    return u.trim();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const name = str(body.name, 200);
  const phone = str(body.phone, 30);
  if (!name || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const district = str(body.district);
  const street = str(body.street);

  if (street && district && !isStreetInDistrict(district, street)) {
    return NextResponse.json(
      { error: "Street does not belong to the selected district." },
      { status: 422 }
    );
  }

  // Validate and sanitize photo URLs — only accept https URLs
  const rawPhotos: unknown[] = Array.isArray(body.photos) ? body.photos.slice(0, MAX_PHOTOS) : [];
  const photos: string[] = rawPhotos.map(safePhotoUrl).filter((u): u is string => u !== null);

  const message = [
    `[PROPERTY SUBMISSION]`,
    `Type: ${str(body.propertyType)} | Purpose: ${str(body.purpose)}`,
    `District: ${district} | Street: ${street} | Building: ${str(body.buildingNumber)}`,
    `Price: ${str(body.price)} ${str(body.currency, 10)}`,
    body.area ? `Area: ${str(body.area)} m²` : "",
    body.rooms ? `Rooms: ${str(body.rooms)}` : "",
    body.floor || body.totalFloors ? `Floor: ${str(body.floor)}/${str(body.totalFloors)}` : "",
    body.bedrooms ? `Bedrooms: ${str(body.bedrooms)}` : "",
    body.bathrooms ? `Bathrooms: ${str(body.bathrooms)}` : "",
    body.buildingType ? `Building type: ${str(body.buildingType)}` : "",
    body.openBalcony && body.openBalcony !== "0" ? `Open balcony: ${str(body.openBalcony)}` : "",
    body.closedBalcony && body.closedBalcony !== "0" ? `Closed balcony: ${str(body.closedBalcony)}` : "",
    body.ceilingHeight ? `Ceiling: ${str(body.ceilingHeight)} m` : "",
    body.view ? `View: ${str(body.view)}` : "",
    `Description: ${str(body.description, 2000)}`,
    photos.length > 0 ? `Photos:\n${photos.join("\n")}` : "",
  ].filter(Boolean).join("\n").slice(0, MAX_MSG);

  await prisma.contactRequest.create({
    data: {
      name,
      phone,
      email: body.email ? str(body.email, 254) : null,
      message,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
