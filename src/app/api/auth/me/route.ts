import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  await ensureDatabase();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, role: true, isActive: true, totpEnabled: true },
  });
  if (!user || !user.isActive) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role, totpEnabled: user.totpEnabled },
  });
}
