import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { createClient, listClients } from "@/services/clientService";
import type { ClientFilters, ClientInput } from "@/types/client";

export async function GET(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const filters: ClientFilters = {
    search: params.get("search") || undefined,
    status: (params.get("status") as ClientFilters["status"]) || undefined,
    propertyType: (params.get("propertyType") as ClientFilters["propertyType"]) || undefined,
    purpose: (params.get("purpose") as ClientFilters["purpose"]) || undefined,
    includeArchived: params.get("includeArchived") === "true",
  };

  const clients = await listClients(filters);
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ClientInput | null;
  if (!body?.fullName?.trim() || !body?.phone?.trim()) {
    return NextResponse.json({ error: "fullName and phone are required" }, { status: 400 });
  }

  const client = await createClient(body);
  return NextResponse.json({ client }, { status: 201 });
}
