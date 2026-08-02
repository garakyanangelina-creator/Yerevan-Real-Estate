import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  await ensureDatabase();
  const session = await getSession();
  if (!session || session.role !== "super_admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, createdById: true },
  });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  await ensureDatabase();
  const session = await getSession();
  if (!session || session.role !== "super_admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = typeof body?.role === "string" ? body.role : "employee";
  const email = typeof body?.email === "string" ? body.email.trim() || null : null;

  if (!username || !password) {
    return NextResponse.json({ error: "username and password required" }, { status: 400 });
  }
  if (!["super_admin", "admin", "employee"].includes(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "username already taken" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, role, createdById: session.userId },
    select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
