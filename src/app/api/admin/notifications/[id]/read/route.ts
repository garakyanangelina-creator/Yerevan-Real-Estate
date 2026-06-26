import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { markNotificationRead } from "@/services/notificationService";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await markNotificationRead(id);
  return NextResponse.json({ ok: true });
}
