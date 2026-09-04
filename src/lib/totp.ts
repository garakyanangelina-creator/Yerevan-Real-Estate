import "server-only";
import { authenticator } from "otplib";

// 30-second window, standard TOTP
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
