import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { generateTotpSecret, getTotpUri } from "@/lib/totp";
import QRCode from "qrcode";

// GET: generate a new TOTP secret and return the QR URI (not yet saved)
export async function GET() {
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

  // Generate QR code as SVG (no canvas dependency needed)
  const qrSvg = await QRCode.toString(uri, { type: "svg", width: 200, margin: 2 });
  const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString("base64")}`;

  // Store the pending secret temporarily (user must verify before it's activated)
  await prisma.user.update({ where: { id: session.userId }, data: { totpSecret: secret, totpEnabled: false } });

  return NextResponse.json({ secret, uri, qrDataUrl });
}
