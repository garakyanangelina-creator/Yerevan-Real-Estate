import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/listings/${filename}`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": file.type || "image/jpeg",
        "x-upsert": "true",
      },
      body: arrayBuffer,
    },
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/listings/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
