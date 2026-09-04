import "server-only";
import crypto from "crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) { out += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str: string): Buffer {
  const s = str.toUpperCase().replace(/=+$/, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of s) {
    const idx = BASE32.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

function hotp(key: Buffer, counter: number): number {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[19] & 0xf;
  return (((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) |
          ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff)) % 1_000_000;
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function getTotpUri(secret: string, username: string): string {
  const issuer = "Yerevan Real Estate";
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(username)}?${params}`;
}

export function verifyTotpCode(token: string, secret: string): boolean {
  try {
    const key = base32Decode(secret);
    const counter = Math.floor(Date.now() / 1000 / 30);
    for (let d = -1; d <= 1; d++) {
      if (hotp(key, counter + d) === parseInt(token, 10)) return true;
    }
    return false;
  } catch { return false; }
}
