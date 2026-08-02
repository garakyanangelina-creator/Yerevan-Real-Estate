import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminProperties } from "@/services/propertyService";

export async function GET() {
  const session = await getSession();
  if (!session || !["super_admin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await getAdminProperties();
  return NextResponse.json(result);
}
