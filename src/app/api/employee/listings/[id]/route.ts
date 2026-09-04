import { NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeAuditLog, getIp } from "@/lib/audit";
import {
  ALLOWED_TYPES,
  ALLOWED_PURPOSES,
  ALLOWED_DISTRICTS,
  ALLOWED_CURRENCIES,
  ALLOWED_STATUSES,
  sanitizeImageUrls,
} from "@/lib/listingValidation";

async function getListing(id: string) {
  return prisma.dbProperty.findUnique({
    where: { id },
    include: { createdBy: { select: { username: true } } },
  });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await ensureDatabase();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await getListing(params.id);
  if (!listing) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Employees can only view their own
  if (session.role === "employee" && listing.createdById !== session.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ listing });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await ensureDatabase();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await getListing(params.id);
  if (!listing) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (session.role === "employee" && listing.createdById !== session.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (body?.title) {
    const title = String(body.title).trim().slice(0, 300);
    if (title) data.title = title;
  }
  if (body?.description !== undefined)
    data.description = body.description ? String(body.description).trim().slice(0, 5000) : null;
  if (body?.type && ALLOWED_TYPES.has(body.type)) data.type = body.type;
  if (body?.purpose && ALLOWED_PURPOSES.has(body.purpose)) data.purpose = body.purpose;
  if (body?.district && ALLOWED_DISTRICTS.has(body.district)) data.district = body.district;
  if (body?.address !== undefined)
    data.address = body.address ? String(body.address).trim().slice(0, 500) : null;
  if (body?.price !== undefined) data.price = Math.max(0, Number(body.price) || 0);
  if (body?.currency && ALLOWED_CURRENCIES.has(body.currency)) data.currency = body.currency;
  if (body?.bedrooms !== undefined) data.bedrooms = Math.max(0, Math.min(20, Number(body.bedrooms) || 0));
  if (body?.bathrooms !== undefined) data.bathrooms = Math.max(0, Math.min(20, Number(body.bathrooms) || 0));
  if (body?.area !== undefined) data.area = Math.max(0, Number(body.area) || 0);
  if (body?.floor !== undefined) data.floor = Math.max(0, Math.min(200, Number(body.floor) || 0));
  if (body?.totalFloors !== undefined) data.totalFloors = Math.max(0, Math.min(200, Number(body.totalFloors) || 0));
  if (body?.images !== undefined) data.images = JSON.stringify(sanitizeImageUrls(body.images));
  if (body?.amenities !== undefined) data.amenities = JSON.stringify(body.amenities ?? {});
  if (body?.status && ALLOWED_STATUSES.has(body.status)) data.status = body.status;

  // Only admins can publish/feature
  if (session.role !== "employee") {
    if (body?.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);
    if (body?.featured !== undefined) data.featured = Boolean(body.featured);
  }

  const updated = await prisma.dbProperty.update({ where: { id: params.id }, data });
  await writeAuditLog({ session, action: "listing.update", target: listing.title, targetId: params.id, ip: getIp(request) });
  return NextResponse.json({ listing: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await ensureDatabase();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await getListing(params.id);
  if (!listing) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (session.role === "employee" && listing.createdById !== session.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.dbProperty.delete({ where: { id: params.id } });
  await writeAuditLog({ session, action: "listing.delete", target: listing.title, targetId: params.id, ip: getIp(request) });
  return NextResponse.json({ ok: true });
}
