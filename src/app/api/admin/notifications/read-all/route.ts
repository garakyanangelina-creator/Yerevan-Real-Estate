import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { markAllNotificationsRead } from "@/services/notificationService";

export async function POST() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await markAllNotificationsRead();
  return NextResponse.json({ ok: true });
}
