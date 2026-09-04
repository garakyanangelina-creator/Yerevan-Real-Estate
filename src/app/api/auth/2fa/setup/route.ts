import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { generateTotpSecret, getTotpUri } from "@/lib/totp";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureDatabase();
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { username: true, totpEnabled: true } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (user.totpEnabled) {
      return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 });
    }

    const secret = generateTotpSecret();
    const uri = getTotpUri(secret, user.username);

    await prisma.user.update({ where: { id: session.userId }, data: { totpSecret: secret, totpEnabled: false } });

    return NextResponse.json({ secret, uri });
  } catch (err) {
    console.error("[2fa/setup] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
