import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { newUsername, password } = await req.json();
  if (!newUsername || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const username = newUsername.trim();
  if (username.length < 3)
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
  if (!/^[a-zA-Z0-9_.-]+$/.test(username))
    return NextResponse.json({ error: "Username can only contain letters, numbers, _ . -" }, { status: 400 });

  await ensureDatabase();

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { compareSync } = await import("bcryptjs");
  if (!compareSync(password, user.passwordHash))
    return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });

  const existing = await prisma.user.findFirst({ where: { username, NOT: { id: session.userId } } });
  if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 409 });

  await prisma.user.update({ where: { id: session.userId }, data: { username } });
  return NextResponse.json({ ok: true });
}
