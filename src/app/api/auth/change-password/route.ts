import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { currentPassword, newPassword } = body ?? {};
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (typeof newPassword !== "string" || newPassword.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  if (newPassword.length > 128)
    return NextResponse.json({ error: "Password too long" }, { status: 400 });

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
