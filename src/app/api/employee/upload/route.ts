import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { validateUploadFile, safeFilename } from "@/lib/uploadValidation";

export async function POST(request: Request) {
  // Authentication required
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Validate file type and size
  const validationError = validateUploadFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError.error }, { status: validationError.status });
  }

  const filename = safeFilename("", file.name);
  const arrayBuffer = await file.arrayBuffer();

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/listings/${filename}`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "image/jpeg", // always declare image/jpeg — don't trust browser Content-Type
        "x-upsert": "true",
      },
      body: arrayBuffer,
    },
  );

  if (!uploadRes.ok) {
    // Don't leak storage error details to the client
    console.error("[upload] Supabase upload failed:", uploadRes.status);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/listings/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
