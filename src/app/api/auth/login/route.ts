import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  await ensureDatabase();

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  const token = await createSessionToken(user.id, user.role as import("@/lib/session").Role);
  const response = NextResponse.json({ ok: true, role: user.role });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
