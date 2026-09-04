import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { verifyTotpCode } from "@/lib/totp";
import { writeAuditLog, getIp } from "@/lib/audit";
import { compareSync } from "bcryptjs";

// POST: disable 2FA (requires current password + TOTP code)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDatabase();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { totpSecret: true, totpEnabled: true, passwordHash: true },
  });
  if (!user || !user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!password || !code) {
    return NextResponse.json({ error: "Password and authenticator code required" }, { status: 400 });
  }

  if (!compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
  }
  if (!verifyTotpCode(code, user.totpSecret)) {
    return NextResponse.json({ error: "Invalid authenticator code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { totpEnabled: false, totpSecret: null },
  });

  await writeAuditLog({ session, action: "account.2fa_disable", ip: getIp(request) });

  return NextResponse.json({ ok: true });
}
