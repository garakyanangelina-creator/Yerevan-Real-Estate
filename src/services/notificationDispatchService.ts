import "server-only";

import type { Client } from "@/types/client";
import type { Property } from "@/types/property";

/**
 * Phase 3 (not implemented yet): outbound notification senders for matched
 * clients. The matching engine and data already exist (see matchingService.ts
 * and notificationService.ts) — this module is the seam where real
 * WhatsApp/Email/SMS providers get wired in later, so the admin UI can call a
 * stable interface today without depending on which provider is chosen.
 *
 * Suggested providers when this gets built: WhatsApp Business Cloud API,
 * a transactional email service (Postmark/SES/Resend), and an SMS gateway
 * (Twilio or a local Armenian provider). Each function should become an
 * async call to that provider's API, with delivery status persisted on the
 * Client/Notification rows for the admin UI to display.
 */

export interface DispatchResult {
  sent: boolean;
  reason: string;
}

function notImplemented(channel: string): DispatchResult {
  return { sent: false, reason: `${channel} dispatch is not implemented yet (Phase 3).` };
}

export async function sendWhatsAppMessage(_client: Client, _property: Property): Promise<DispatchResult> {
  return notImplemented("WhatsApp");
}

export async function sendEmail(_client: Client, _property: Property): Promise<DispatchResult> {
  return notImplemented("Email");
}

export async function sendSms(_client: Client, _property: Property): Promise<DispatchResult> {
  return notImplemented("SMS");
}
