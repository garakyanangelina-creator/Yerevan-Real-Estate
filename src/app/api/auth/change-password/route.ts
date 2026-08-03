import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (newPassword.length < 6)
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  await ensureDatabase();

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { compareSync, hashSync } = await import("bcryptjs");
  if (!compareSync(currentPassword, user.passwordHash))
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: hashSync(newPassword, 12) },
  });

  return NextResponse.json({ ok: true });
}
