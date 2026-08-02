import { NextResponse } from "next/server";

// Delegate to the unified auth login endpoint
export async function POST(request: Request) {
  const url = new URL("/api/auth/login", request.url);
  return fetch(url, {
    method: "POST",
    headers: request.headers,
    body: request.body,
    // @ts-expect-error duplex required for streaming body
    duplex: "half",
  });
}
