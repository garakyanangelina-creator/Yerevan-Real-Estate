import { NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/adminAuth";
import { getAdminProperties } from "@/services/propertyService";

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await getAdminProperties();
  return NextResponse.json(result);
}
