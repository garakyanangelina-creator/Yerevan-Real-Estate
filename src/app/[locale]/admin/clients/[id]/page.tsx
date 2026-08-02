"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import AdminNav from "@/components/admin/AdminNav";
import { formatPrice } from "@/lib/utils";
import type { Client } from "@/types/client";
import type { Property } from "@/types/property";

interface PropertyMatch {
  score: number;
  reasons: string[];
  property: Property;
}

export default function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("clients");
  const tMatching = useTranslations("matching");
  const tDistricts = useTranslations("districts");
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [matches, setMatches] = useState<PropertyMatch[] | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/clients/${id}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/admin");
          return null;
        }
        if (res.status === 404) {
          if (active) setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (active && data) setClient(data.client);
      });

    fetch(`/api/admin/clients/${id}/matches`)
      .then((res) => (res.ok ? res.json() : { matches: [] }))
      .then((data) => {
        if (active) setMatches(data.matches ?? []);
      });

    return () => {
      active = false;
    };
  }, [id, router]);

  if (notFound) {
    return (
      <div className="container-page py-10">
        <AdminNav active="clients" role="admin" />
        <p className="mt-10 text-center text-primary-500 dark:text-white/60">{t("noClients")}</p>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="container-page py-10">
      <AdminNav active="clients" role="admin" />

      <Link href="/admin/clients" className="mt-6 flex items-center gap-1.5 text-sm text-primary-600 hover:text-gold-600 dark:text-white/70">
        <ArrowLeft className="h-4 w-4" /> {t("backToClients")}
      </Link>

      <div className="mt-4 card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-semibold text-primary-900 dark:text-white">{client.fullName}</h1>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium capitalize text-primary-700 dark:bg-white/10 dark:text-white/70">
            {client.status}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-primary-400">{t("phone")}</dt>
            <dd className="font-medium text-primary-800 dark:text-white">{client.phone}</dd>
          </div>
          {client.whatsapp && (
            <div>
              <dt className="text-primary-400">{t("whatsapp")}</dt>
              <dd className="font-medium text-primary-800 dark:text-white">{client.whatsapp}</dd>
            </div>
          )}
          {client.email && (
            <div>
              <dt className="text-primary-400">{t("email")}</dt>
              <dd className="font-medium text-primary-800 dark:text-white">{client.email}</dd>
            </div>
          )}
          <div>
            <dt className="text-primary-400">{t("propertyType")} / {t("purpose")}</dt>
            <dd className="font-medium capitalize text-primary-800 dark:text-white">
              {client.propertyType} · {client.purpose}
            </dd>
          </div>
          {client.preferredDistricts.length > 0 && (
            <div>
              <dt className="text-primary-400">{t("preferredDistricts")}</dt>
              <dd className="font-medium text-primary-800 dark:text-white">
                {client.preferredDistricts.map((d) => tDistricts(d)).join(", ")}
              </dd>
            </div>
          )}
          {(client.minBudget != null || client.maxBudget != null) && (
            <div>
              <dt className="text-primary-400">{t("minBudget")} / {t("maxBudget")}</dt>
              <dd className="font-medium text-primary-800 dark:text-white">
                {client.minBudget ?? "—"} – {client.maxBudget ?? "—"}
              </dd>
            </div>
          )}
        </dl>
        {client.notes && (
          <p className="mt-4 text-sm text-primary-600 dark:text-white/70">{client.notes}</p>
        )}
      </div>

      <h2 className="mt-10 font-serif text-2xl font-semibold text-primary-900 dark:text-white">
        {t("matchingProperties")}
      </h2>

      {matches === null ? null : matches.length === 0 ? (
        <p className="mt-4 text-primary-500 dark:text-white/60">{tMatching("noMatchingProperties")}</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <div key={m.property.id} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700 dark:bg-gold-500/20 dark:text-gold-300">
                  {tMatching("matchScore", { score: m.score })}
                </span>
                <span className="text-sm font-semibold text-primary-800 dark:text-white">
                  {formatPrice(m.property.price, m.property.purpose, m.property.currency)}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 font-medium text-primary-900 dark:text-white">{m.property.title}</p>
              <p className="text-sm text-primary-500 dark:text-white/60">{tDistricts(m.property.district)}</p>
              <ul className="mt-2 space-y-1 text-xs text-primary-600 dark:text-white/70">
                {m.reasons.map((reason) => (
                  <li key={reason}>✓ {tMatching(reason)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
