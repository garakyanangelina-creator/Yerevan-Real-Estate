"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Eye, EyeOff, Trash2, Pencil, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AdminNav from "@/components/admin/AdminNav";
import MatchingClientsModal from "@/components/admin/MatchingClientsModal";
import type { Property, PropertyFetchErrorCode } from "@/types/property";

function AdminDashboardContent() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tMatching = useTranslations("matching");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized">("loading");
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<PropertyFetchErrorCode>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [matchesFor, setMatchesFor] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = searchParams.get("matchesFor");
    if (fromQuery) setMatchesFor(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/properties")
      .then(async (res) => {
        if (res.status === 401) {
          if (active) setStatus("unauthorized");
          router.replace("/admin");
          return;
        }
        const data = await res.json();
        if (!active) return;
        setProperties(data.properties ?? []);
        setError(data.error ?? null);
        setStatus("ready");
      })
      .catch(() => {
        if (active) {
          setError("network");
          setStatus("ready");
        }
      });
    return () => {
      active = false;
    };
  }, [router]);

  if (status !== "ready") return null;

  const stats = [
    { label: t("properties"), value: properties.length },
    { label: t("messages"), value: 0 },
    { label: t("contactRequests"), value: 0 },
    { label: t("owners"), value: properties.length },
  ];

  return (
    <div className="container-page py-10">
      <AdminNav active="dashboard" />

      <h1 className="mt-6 font-serif text-3xl font-semibold text-primary-900 dark:text-white">
        {t("dashboard")}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-semibold text-primary-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-primary-500 dark:text-white/60">{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
          {tCommon("fetchErrorTitle")}:{" "}
          {error === "config" ? tCommon("fetchErrorConfig") : tCommon("fetchErrorNetwork")}
        </div>
      )}

      {!error && properties.length === 0 && (
        <p className="mt-10 text-center text-primary-500 dark:text-white/60">
          {tCommon("noProperties")}
        </p>
      )}

      {properties.length > 0 && (
        <div className="mt-10 card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary-100 text-primary-500 dark:border-white/10 dark:text-white/60">
              <tr>
                <th className="px-4 py-3">{t("properties")}</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-primary-50 dark:border-white/5">
                  <td className="px-4 py-3 font-medium text-primary-800 dark:text-white">{p.title}</td>
                  <td className="px-4 py-3">{formatPrice(p.price, p.purpose, p.currency)}</td>
                  <td className="px-4 py-3">{p.ownerName || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setRevealed((r) => ({ ...r, [p.id]: !r[p.id] }))}
                      className="flex items-center gap-1.5 text-primary-600 hover:text-gold-600 dark:text-white/70"
                    >
                      {revealed[p.id] ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> {p.ownerPhone || "—"}
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" /> {t("viewPhone")}
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setMatchesFor(p.id)}
                        title={tMatching("matchingClients")}
                        className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-primary-600 hover:bg-primary-50 dark:text-white/70 dark:hover:bg-white/10"
                      >
                        <Users className="h-3.5 w-3.5" /> {tMatching("matchingClients")}
                      </button>
                      <button className="rounded p-1.5 hover:bg-primary-50 dark:hover:bg-white/10">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1.5 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-primary-400">
        Listings are fetched live from Apify on each load. Edit / Delete actions here are UI-only
        until a write-back endpoint exists (Phase 2).
      </p>

      {matchesFor && (
        <MatchingClientsModal propertyId={matchesFor} onClose={() => setMatchesFor(null)} />
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardContent />
    </Suspense>
  );
}
