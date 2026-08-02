import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listClients } from "@/services/clientService";
import { findMatchingClients } from "@/services/matchingService";
import { getAdminProperties } from "@/services/propertyService";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authSession = await getSession(); if (!_authSession || !["super_admin","admin"].includes(_authSession.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { properties, error } = await getAdminProperties();
  const property = properties.find((p) => p.id === id);
  if (!property) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const clients = await listClients({ includeArchived: false });
  const matches = findMatchingClients(property, clients);
  return NextResponse.json({ matches, propertyError: error });
}
