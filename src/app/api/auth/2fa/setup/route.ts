import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { generateTotpSecret, getTotpUri } from "@/lib/totp";

export async function GET() {
  try {
    console.log("[2fa/setup] step 1: getSession");
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("[2fa/setup] step 2: ensureDatabase");
    await ensureDatabase();

    console.log("[2fa/setup] step 3: findUnique user", session.userId);
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { username: true, totpEnabled: true } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    console.log("[2fa/setup] step 4: totpEnabled =", user.totpEnabled);
    if (user.totpEnabled) {
      return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 });
    }

    console.log("[2fa/setup] step 5: generateTotpSecret");
    const secret = generateTotpSecret();

    console.log("[2fa/setup] step 6: getTotpUri");
    const uri = getTotpUri(secret, user.username);

    console.log("[2fa/setup] step 7: update user");
    await prisma.user.update({ where: { id: session.userId }, data: { totpSecret: secret, totpEnabled: false } });

    console.log("[2fa/setup] done");
    return NextResponse.json({ secret, uri });
  } catch (err) {
    console.error("[2fa/setup] FAILED:", String(err));
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
