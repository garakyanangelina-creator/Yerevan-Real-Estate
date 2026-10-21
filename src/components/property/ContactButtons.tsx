"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Phone, CalendarCheck, Send } from "lucide-react";

const AGENCY_PHONE = "+374 44 222 310";
const AGENCY_WHATSAPP = "37444222310";
const AGENCY_TELEGRAM = "Yere1realestate";

export default function ContactButtons({ propertyId }: { propertyId: string }) {
  const t = useTranslations("property");

  const listingText = encodeURIComponent(`Hi, I'm interested in listing ${propertyId}`);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <a
        href={`https://wa.me/${AGENCY_WHATSAPP}?text=${listingText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary bg-green-600 hover:bg-green-500"
      >
        <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
      </a>
      <a href={`tel:${AGENCY_PHONE.replace(/\s/g, "")}`} className="btn-outline">
        <Phone className="h-4 w-4" /> {t("call")}
      </a>
      <a
        href={`https://t.me/${AGENCY_TELEGRAM}?text=${listingText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline sm:col-span-2"
      >
        <Send className="h-4 w-4" /> Telegram
      </a>
      <a
        href={`https://t.me/${AGENCY_TELEGRAM}?text=${encodeURIComponent(`Hi, I'd like to request a viewing for listing ${propertyId}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-gold sm:col-span-2"
      >
        <CalendarCheck className="h-4 w-4" /> {t("requestViewing")}
      </a>
    </div>
  );
}
