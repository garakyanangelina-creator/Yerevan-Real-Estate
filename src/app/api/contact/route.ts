import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.phone || !body?.message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const contact = await prisma.contactRequest.create({
    data: {
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : null,
      message: String(body.message).trim(),
      propertyId: body.propertyId ? String(body.propertyId) : null,
    },
  });

  return NextResponse.json({ ok: true, id: contact.id }, { status: 201 });
}
