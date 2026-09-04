import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_NAME = 200;
const MAX_PHONE = 30;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.phone || !body?.message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const name = String(body.name).trim().slice(0, MAX_NAME);
  const phone = String(body.phone).trim().slice(0, MAX_PHONE);
  const message = String(body.message).trim().slice(0, MAX_MESSAGE);
  const email = body.email ? String(body.email).trim().slice(0, MAX_EMAIL) : null;
  const propertyId = body.propertyId ? String(body.propertyId).slice(0, 64) : null;

  if (!name || !phone || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await prisma.contactRequest.create({
    data: { name, phone, email, message, propertyId },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
