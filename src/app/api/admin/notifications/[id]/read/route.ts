import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markNotificationRead } from "@/services/notificationService";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authSession = await getSession(); if (!_authSession || !["super_admin","admin"].includes(_authSession.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await markNotificationRead(id);
  return NextResponse.json({ ok: true });
}
