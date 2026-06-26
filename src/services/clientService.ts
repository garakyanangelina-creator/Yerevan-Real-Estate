import "server-only";

import type { Client as PrismaClientRow } from "@prisma/client";
import { ensureCrmDatabase, prisma } from "@/lib/prisma";
import type { Client, ClientFilters, ClientInput } from "@/types/client";

function toClient(row: PrismaClientRow): Client {
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    preferredLanguage: row.preferredLanguage as Client["preferredLanguage"],
    propertyType: row.propertyType as Client["propertyType"],
    purpose: row.purpose as Client["purpose"],
    preferredDistricts: JSON.parse(row.preferredDistricts) as Client["preferredDistricts"],
    minBudget: row.minBudget,
    maxBudget: row.maxBudget,
    minArea: row.minArea,
    maxArea: row.maxArea,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    furnished: row.furnished as Client["furnished"],
    petsAllowed: row.petsAllowed,
    parkingRequired: row.parkingRequired,
    elevatorRequired: row.elevatorRequired,
    balconyRequired: row.balconyRequired,
    notes: row.notes,
    status: row.status as Client["status"],
    archived: row.archived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toRowData(input: ClientInput) {
  return {
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp?.trim() || null,
    email: input.email?.trim() || null,
    preferredLanguage: input.preferredLanguage,
    propertyType: input.propertyType,
    purpose: input.purpose,
    preferredDistricts: JSON.stringify(input.preferredDistricts ?? []),
    minBudget: input.minBudget ?? null,
    maxBudget: input.maxBudget ?? null,
    minArea: input.minArea ?? null,
    maxArea: input.maxArea ?? null,
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    furnished: input.furnished,
    petsAllowed: Boolean(input.petsAllowed),
    parkingRequired: Boolean(input.parkingRequired),
    elevatorRequired: Boolean(input.elevatorRequired),
    balconyRequired: Boolean(input.balconyRequired),
    notes: input.notes?.trim() || null,
    status: input.status ?? "active",
  };
}

export async function listClients(filters: ClientFilters = {}): Promise<Client[]> {
  await ensureCrmDatabase();
  const rows = await prisma.client.findMany({
    where: {
      archived: filters.includeArchived ? undefined : false,
      status: filters.status,
      propertyType: filters.propertyType,
      purpose: filters.purpose,
      ...(filters.search
        ? {
            OR: [
              { fullName: { contains: filters.search } },
              { phone: { contains: filters.search } },
              { email: { contains: filters.search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toClient);
}

/** Active, non-archived clients — the set matching should run against on new-property import. */
export async function listActiveClients(): Promise<Client[]> {
  await ensureCrmDatabase();
  const rows = await prisma.client.findMany({
    where: { archived: false, status: "active" },
  });
  return rows.map(toClient);
}

export async function getClientById(id: string): Promise<Client | null> {
  await ensureCrmDatabase();
  const row = await prisma.client.findUnique({ where: { id } });
  return row ? toClient(row) : null;
}

export async function createClient(input: ClientInput): Promise<Client> {
  await ensureCrmDatabase();
  const row = await prisma.client.create({ data: toRowData(input) });
  return toClient(row);
}

export async function updateClient(id: string, input: ClientInput): Promise<Client | null> {
  await ensureCrmDatabase();
  try {
    const row = await prisma.client.update({ where: { id }, data: toRowData(input) });
    return toClient(row);
  } catch {
    return null;
  }
}

export async function archiveClient(id: string, archived: boolean): Promise<Client | null> {
  await ensureCrmDatabase();
  try {
    const row = await prisma.client.update({ where: { id }, data: { archived } });
    return toClient(row);
  } catch {
    return null;
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  await ensureCrmDatabase();
  try {
    await prisma.client.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
