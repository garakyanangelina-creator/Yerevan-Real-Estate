/**
 * Edge-compatible session token helpers.
 * Uses Web Crypto API (available in Node.js 18+ and Edge Runtime).
 * No `server-only` so this can be imported from middleware.
 */

import type { NextRequest } from "next/server";

export type Role = "super_admin" | "admin" | "employee";

export interface Session {
  userId: string;
  role: Role;
  expiresAt: number;
}

export const SESSION_COOKIE = "yr_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set");
  return s;
}

async function sign(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verify(payload: string, hex: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    sigBytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
}

export async function createSessionToken(userId: string, role: Role): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}:${role}:${expiresAt}`;
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function parseSessionToken(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return null;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const parts = payload.split(":");
  if (parts.length !== 3) return null;
  const [userId, role, expiresAtStr] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;
  if (!["super_admin", "admin", "employee"].includes(role)) return null;
  try {
    const valid = await verify(payload, sig);
    if (!valid) return null;
  } catch {
    return null;
  }
  return { userId, role: role as Role, expiresAt };
}

export async function getSessionFromRequest(req: NextRequest): Promise<Session | null> {
  return parseSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}
