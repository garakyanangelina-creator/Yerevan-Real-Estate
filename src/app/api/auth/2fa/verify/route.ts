import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { verifyTotpCode } from "@/lib/totp";
import { writeAuditLog, getIp } from "@/lib/audit";

// POST: verify the code and activate 2FA
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDatabase();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { totpSecret: true, totpEnabled: true },
  });
  if (!user || !user.totpSecret) {
    return NextResponse.json({ error: "2FA setup not started" }, { status: 400 });
  }
  if (user.totpEnabled) {
    return NextResponse.json({ error: "2FA already enabled" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  if (!verifyTotpCode(code, user.totpSecret)) {
    return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.userId }, data: { totpEnabled: true } });

  await writeAuditLog({ session, action: "account.2fa_enable", ip: getIp(request) });

  return NextResponse.json({ ok: true });
}
