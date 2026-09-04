import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";
import { verifyTotpCode } from "@/lib/totp";
import { writeAuditLog, getIp } from "@/lib/audit";

export async function POST(request: Request) {
  await ensureDatabase();

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const totpCode = typeof body?.totpCode === "string" ? body.totpCode.trim() : "";

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

  // If 2FA is enabled, verify the TOTP code
  if (user.totpEnabled && user.totpSecret) {
    if (!totpCode) {
      // Password correct but 2FA code not provided yet — signal the frontend to show 2FA input
      return NextResponse.json({ ok: false, requireTotp: true }, { status: 200 });
    }
    const totpValid = verifyTotpCode(totpCode, user.totpSecret);
    if (!totpValid) {
      await writeAuditLog({
        session: { userId: user.id, role: user.role as never, expiresAt: 0, username: user.username },
        action: "login.2fa_failed",
        ip: getIp(request),
      });
      return NextResponse.json({ ok: false, error: "Invalid authenticator code" }, { status: 401 });
    }
    await writeAuditLog({
      session: { userId: user.id, role: user.role as never, expiresAt: 0, username: user.username },
      action: "login.2fa_success",
      ip: getIp(request),
    });
  }

  const token = await createSessionToken(user.id, user.role as import("@/lib/session").Role);
  const response = NextResponse.json({ ok: true, role: user.role });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  await writeAuditLog({
    session: { userId: user.id, role: user.role as never, expiresAt: 0, username: user.username },
    action: "login",
    ip: getIp(request),
  });

  return response;
}
