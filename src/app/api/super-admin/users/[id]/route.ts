import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await ensureDatabase();
  const session = await getSession();
  if (!session || session.role !== "super_admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await ensureDatabase();
  const session = await getSession();
  if (!session || session.role !== "super_admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.username === "string" && body.username.trim().length >= 3) {
    const existing = await prisma.user.findFirst({ where: { username: body.username.trim(), NOT: { id: params.id } } });
    if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    data.username = body.username.trim();
  }
  if (typeof body?.email === "string") data.email = body.email.trim() || null;
  if (typeof body?.role === "string" && ["super_admin", "admin", "employee"].includes(body.role))
    data.role = body.role;
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body?.password === "string" && body.password.length >= 8)
    data.passwordHash = await hash(body.password, 12);

  // Prevent deactivating the last super admin
  if (data.isActive === false || data.role !== "super_admin") {
    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (target?.role === "super_admin") {
      const superAdminCount = await prisma.user.count({ where: { role: "super_admin", isActive: true } });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: "Cannot deactivate or demote the last super admin" }, { status: 400 });
      }
    }
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, username: true, email: true, role: true, isActive: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await ensureDatabase();
  const session = await getSession();
  if (!session || session.role !== "super_admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Prevent deleting self
  if (params.id === session.userId)
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (target.role === "super_admin") {
    const count = await prisma.user.count({ where: { role: "super_admin" } });
    if (count <= 1)
      return NextResponse.json({ error: "Cannot delete the last super admin" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
