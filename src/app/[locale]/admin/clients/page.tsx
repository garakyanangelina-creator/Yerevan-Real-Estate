"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Pencil, Trash2, Archive, ArchiveRestore, Plus, Search } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import ClientFormModal from "@/components/admin/ClientFormModal";
import type { Client, ClientStatus } from "@/types/client";

export default function AdminClientsPage() {
  const t = useTranslations("clients");
  const router = useRouter();

  const [authStatus, setAuthStatus] = useState<"loading" | "ready" | "unauthorized">("loading");
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "">("");
  const [showArchived, setShowArchived] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null | "new">(null);

  const loadClients = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (showArchived) params.set("includeArchived", "true");

    const res = await fetch(`/api/admin/clients?${params.toString()}`);
    if (res.status === 401) {
      setAuthStatus("unauthorized");
      router.replace("/admin");
      return;
    }
    const data = await res.json();
    setClients(data.clients ?? []);
    setAuthStatus("ready");
  }, [search, statusFilter, showArchived, router]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  async function toggleArchive(client: Client) {
    await fetch(`/api/admin/clients/${client.id}/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !client.archived }),
    });
    loadClients();
  }

  async function handleDelete(client: Client) {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });
    loadClients();
  }

  if (authStatus === "unauthorized") return null;

  return (
    <div className="container-page py-10">
      <AdminNav active="clients" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-primary-600 dark:text-white/70">{t("subtitle")}</p>
        </div>
        <button onClick={() => setEditingClient("new")} className="btn-gold">
          <Plus className="h-4 w-4" /> {t("addClient")}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-lg border border-primary-100 py-2 pl-9 pr-3 text-sm dark:border-white/10 dark:bg-primary-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClientStatus | "")}
          className="rounded-lg border border-primary-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-primary-900"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="active">{t("statusActive")}</option>
          <option value="paused">{t("statusPaused")}</option>
          <option value="closed">{t("statusClosed")}</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-primary-600 dark:text-white/70">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded border-primary-300 text-gold-500"
          />
          {t("showArchived")}
        </label>
      </div>

      {clients.length === 0 ? (
        <p className="mt-10 text-center text-primary-500 dark:text-white/60">{t("noClients")}</p>
      ) : (
        <div className="mt-6 card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary-100 text-primary-500 dark:border-white/10 dark:text-white/60">
              <tr>
                <th className="px-4 py-3">{t("fullName")}</th>
                <th className="px-4 py-3">{t("phone")}</th>
                <th className="px-4 py-3">{t("propertyType")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-primary-50 dark:border-white/5">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/clients/${client.id}`)}
                      className="font-medium text-primary-800 hover:text-gold-600 dark:text-white"
                    >
                      {client.fullName}
                    </button>
                    {client.archived && (
                      <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-500 dark:bg-white/10 dark:text-white/60">
                        archived
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{client.phone}</td>
                  <td className="px-4 py-3 capitalize">{client.propertyType}</td>
                  <td className="px-4 py-3 capitalize">{client.status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingClient(client)}
                        className="rounded p-1.5 hover:bg-primary-50 dark:hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleArchive(client)}
                        title={client.archived ? t("unarchive") : t("archive")}
                        className="rounded p-1.5 hover:bg-primary-50 dark:hover:bg-white/10"
                      >
                        {client.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDelete(client)} className="rounded p-1.5 text-red-600 hover:bg-red-50">
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

      {editingClient && (
        <ClientFormModal
          client={editingClient === "new" ? null : editingClient}
          onClose={() => setEditingClient(null)}
          onSaved={() => {
            setEditingClient(null);
            loadClients();
          }}
        />
      )}
    </div>
  );
}
