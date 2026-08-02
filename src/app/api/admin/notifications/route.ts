import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  checkForNewPropertiesAndNotify,
  getUnreadNotificationCount,
  listNotifications,
} from "@/services/notificationService";
import { getAdminProperties } from "@/services/propertyService";

/**
 * Runs the "new property since last check" diff against live Apify data
 * before returning the notification list, so this single endpoint is enough
 * to drive the admin notification bell — see notificationService.ts for why
 * this can't be a true push/webhook trigger yet.
 */
export async function GET() {
  const _authSession = await getSession(); if (!_authSession || !["super_admin","admin"].includes(_authSession.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { properties } = await getAdminProperties();
  await checkForNewPropertiesAndNotify(properties);

  const [notifications, unreadCount] = await Promise.all([
    listNotifications(),
    getUnreadNotificationCount(),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
