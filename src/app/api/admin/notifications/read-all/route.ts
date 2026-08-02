import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markAllNotificationsRead } from "@/services/notificationService";

export async function POST() {
  const _authSession = await getSession(); if (!_authSession || !["super_admin","admin"].includes(_authSession.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await markAllNotificationsRead();
  return NextResponse.json({ ok: true });
}
