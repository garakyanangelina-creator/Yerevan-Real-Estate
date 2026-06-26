import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { archiveClient } from "@/services/clientService";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { archived?: boolean };
  const client = await archiveClient(id, body.archived ?? true);
  if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ client });
}
