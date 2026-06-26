import "server-only";

import { prisma } from "@/lib/prisma";
import { listActiveClients } from "@/services/clientService";
import { findMatchingClients } from "@/services/matchingService";
import type { Property } from "@/types/property";

export interface AdminNotification {
  id: string;
  propertyId: string;
  propertyTitle: string;
  matchCount: number;
  isRead: boolean;
  createdAt: string;
}

/**
 * Properties are fetched live from Apify on every request rather than stored,
 * so there's no database row that flips from "absent" to "present" the
 * instant a new listing appears. Instead, this compares the current live set
 * against SeenProperty (ids we've already processed) and treats anything new
 * as "just imported" — called whenever an admin loads the dashboard /
 * notifications, since that's the only place this needs to run (the public
 * site never touches this).
 *
 * Phase 3: if Apify webhooks or a cron job become available, call this from
 * that trigger instead for true real-time notifications.
 */
export async function checkForNewPropertiesAndNotify(
  liveProperties: Property[]
): Promise<AdminNotification[]> {
  if (liveProperties.length === 0) return [];

  const seenIds = new Set(
    (await prisma.seenProperty.findMany({ select: { id: true } })).map((row) => row.id)
  );
  const newProperties = liveProperties.filter((p) => !seenIds.has(p.id));
  if (newProperties.length === 0) return [];

  const activeClients = await listActiveClients();
  const created: AdminNotification[] = [];

  for (const property of newProperties) {
    const matches = findMatchingClients(property, activeClients);

    await prisma.seenProperty.create({ data: { id: property.id } }).catch(() => {
      // Race with a concurrent request already marking it seen — fine to ignore.
    });

    if (matches.length > 0) {
      const row = await prisma.notification.create({
        data: {
          propertyId: property.id,
          propertyTitle: property.title,
          matchCount: matches.length,
        },
      });
      created.push({
        id: row.id,
        propertyId: row.propertyId,
        propertyTitle: row.propertyTitle,
        matchCount: row.matchCount,
        isRead: row.isRead,
        createdAt: row.createdAt.toISOString(),
      });
    }
  }

  return created;
}

export async function listNotifications(limit = 30): Promise<AdminNotification[]> {
  const rows = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    propertyId: row.propertyId,
    propertyTitle: row.propertyTitle,
    matchCount: row.matchCount,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  return prisma.notification.count({ where: { isRead: false } });
}

export async function markNotificationRead(id: string): Promise<void> {
  await prisma.notification.update({ where: { id }, data: { isRead: true } }).catch(() => {});
}

export async function markAllNotificationsRead(): Promise<void> {
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
}
