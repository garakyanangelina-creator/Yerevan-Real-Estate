import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isStreetInDistrict } from "@/lib/yerevan-streets";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (body.street && body.district && !isStreetInDistrict(body.district, body.street)) {
    return NextResponse.json(
      { error: "Street does not belong to the selected district." },
      { status: 422 }
    );
  }

  const photos: string[] = Array.isArray(body.photos) ? body.photos : [];

  const addr = [body.district, body.street, body.buildingNumber].filter(Boolean).join(", ");
  const message = [
    `[PROPERTY SUBMISSION]`,
    `Type: ${body.propertyType ?? "—"} | Purpose: ${body.purpose ?? "—"}`,
    `District: ${body.district ?? "—"} | Street: ${body.street ?? "—"} | Building: ${body.buildingNumber ?? "—"}`,
    `Price: ${body.price ?? "—"} ${body.currency ?? "AMD"}`,
    body.area ? `Area: ${body.area} m²` : "",
    body.rooms ? `Rooms: ${body.rooms}` : "",
    body.floor || body.totalFloors ? `Floor: ${body.floor ?? "—"}/${body.totalFloors ?? "—"}` : "",
    body.bedrooms ? `Bedrooms: ${body.bedrooms}` : "",
    body.bathrooms ? `Bathrooms: ${body.bathrooms}` : "",
    body.buildingType ? `Building type: ${body.buildingType}` : "",
    (body.openBalcony && body.openBalcony !== "0") ? `Open balcony: ${body.openBalcony}` : "",
    (body.closedBalcony && body.closedBalcony !== "0") ? `Closed balcony: ${body.closedBalcony}` : "",
    body.ceilingHeight ? `Ceiling: ${body.ceilingHeight} m` : "",
    body.view ? `View: ${body.view}` : "",
    `Description: ${body.description ?? "—"}`,
    photos.length > 0 ? `Photos:\n${photos.join("\n")}` : "",
  ].filter(Boolean).join("\n");

  await prisma.contactRequest.create({
    data: {
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : null,
      message,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
