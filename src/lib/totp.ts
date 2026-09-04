import "server-only";

// otplib doesn't have perfect ESM types — use dynamic require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const otplib = require("otplib");
const authenticator = otplib.authenticator ?? otplib.default?.authenticator ?? otplib;

authenticator.options = { window: 1 };

export function generateTotpSecret(): string {
  return authenticator.generateSecret(32);
}

export function verifyTotpCode(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export function getTotpUri(secret: string, username: string): string {
  return authenticator.keyuri(username, "Yerevan Real Estate", secret);
}
