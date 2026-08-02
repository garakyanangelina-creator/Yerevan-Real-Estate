import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteClient, getClientById, updateClient } from "@/services/clientService";
import type { ClientInput } from "@/types/client";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authSession = await getSession(); if (!_authSession || !["super_admin","admin"].includes(_authSession.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authSession = await getSession(); if (!_authSession || !["super_admin","admin"].includes(_authSession.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as ClientInput | null;
  if (!body?.fullName?.trim() || !body?.phone?.trim()) {
    return NextResponse.json({ error: "fullName and phone are required" }, { status: 400 });
  }

  const client = await updateClient(id, body);
  if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ client });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const _authSession = await getSession(); if (!_authSession || !["super_admin","admin"].includes(_authSession.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteClient(id);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
