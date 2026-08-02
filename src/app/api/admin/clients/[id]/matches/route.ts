import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getClientById } from "@/services/clientService";
import { findMatchingProperties } from "@/services/matchingService";
import { getAdminProperties } from "@/services/propertyService";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authSession = await getSession(); if (!_authSession || !["super_admin","admin"].includes(_authSession.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { properties, error } = await getAdminProperties();
  const matches = findMatchingProperties(client, properties);
  return NextResponse.json({ matches, error });
}
