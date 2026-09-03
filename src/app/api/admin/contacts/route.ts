import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "employee"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contacts = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contacts });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "employee"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.contactRequest.update({
    where: { id: body.id },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
