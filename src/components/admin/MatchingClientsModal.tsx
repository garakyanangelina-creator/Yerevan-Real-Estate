"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Phone, MessageCircle, Mail } from "lucide-react";

interface ClientMatch {
  score: number;
  reasons: string[];
  client: {
    id: string;
    fullName: string;
    phone: string;
    whatsapp: string | null;
    email: string | null;
  };
}

export default function MatchingClientsModal({
  propertyId,
  onClose,
}: {
  propertyId: string;
  onClose: () => void;
}) {
  const t = useTranslations("matching");
  const [matches, setMatches] = useState<ClientMatch[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/properties/${propertyId}/matches`)
      .then((res) => (res.ok ? res.json() : { matches: [] }))
      .then((data) => {
        if (active) setMatches(data.matches ?? []);
      })
      .catch(() => {
        if (active) setMatches([]);
      });
    return () => {
      active = false;
    };
  }, [propertyId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl2 bg-white p-6 shadow-soft dark:bg-primary-800">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
            {t("matchingClients")}
          </h2>
          <button onClick={onClose} aria-label={t("close")} className="rounded-full p-1.5 hover:bg-primary-50 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {matches === null ? (
            <p className="text-sm text-primary-500 dark:text-white/60">…</p>
          ) : matches.length === 0 ? (
            <p className="text-sm text-primary-500 dark:text-white/60">{t("noMatches")}</p>
          ) : (
            matches.map((m) => (
              <div key={m.client.id} className="rounded-xl border border-primary-100 p-4 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-primary-900 dark:text-white">{m.client.fullName}</p>
                  <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700 dark:bg-gold-500/20 dark:text-gold-300">
                    {t("matchScore", { score: m.score })}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-primary-600 dark:text-white/70">
                  {m.reasons.map((reason) => (
                    <li key={reason}>✓ {t(reason)}</li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <a href={`tel:${m.client.phone}`} className="btn-outline flex-1 px-3 py-1.5 text-xs">
                    <Phone className="h-3.5 w-3.5" /> {t("call")}
                  </a>
                  {m.client.whatsapp && (
                    <a
                      href={`https://wa.me/${m.client.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline flex-1 px-3 py-1.5 text-xs"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> {t("whatsapp")}
                    </a>
                  )}
                  {m.client.email && (
                    <a href={`mailto:${m.client.email}`} className="btn-outline flex-1 px-3 py-1.5 text-xs">
                      <Mail className="h-3.5 w-3.5" /> {t("email")}
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
