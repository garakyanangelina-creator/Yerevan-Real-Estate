"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Phone, CalendarCheck } from "lucide-react";

const AGENCY_PHONE = "+374 10 000 000";
const AGENCY_WHATSAPP = "37400000000";

export default function ContactButtons({ propertyId }: { propertyId: string }) {
  const t = useTranslations("property");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <a
        href={`https://wa.me/${AGENCY_WHATSAPP}?text=${encodeURIComponent(
          `Hi, I'm interested in listing ${propertyId}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary bg-green-600 hover:bg-green-500"
      >
        <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
      </a>
      <a href={`tel:${AGENCY_PHONE.replace(/\s/g, "")}`} className="btn-outline">
        <Phone className="h-4 w-4" /> {t("call")}
      </a>
      <button className="btn-gold sm:col-span-2">
        <CalendarCheck className="h-4 w-4" /> {t("requestViewing")}
      </button>
    </div>
  );
}
