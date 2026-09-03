import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const photos: string[] = Array.isArray(body.photos) ? body.photos : [];

  const message = [
    `[PROPERTY SUBMISSION]`,
    `Type: ${body.propertyType ?? "—"} | Purpose: ${body.purpose ?? "—"}`,
    `Address: ${body.address ?? "—"} | District: ${body.district ?? "—"}`,
    `Price: ${body.price ?? "—"}`,
    `Description: ${body.description ?? "—"}`,
    photos.length > 0 ? `Photos: ${photos.join(", ")}` : "",
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
