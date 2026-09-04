"use client";

import { useEffect, useState } from "react";
import { ClipboardList, ChevronLeft, ChevronRight, RefreshCw, Shield } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

interface AuditEntry {
  id: string;
  username: string;
  role: string;
  action: string;
  target: string | null;
  targetId: string | null;
  ip: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  "login": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "logout": "bg-primary-100 text-primary-600 dark:bg-white/10 dark:text-white/60",
  "login.2fa_success": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "login.2fa_failed": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "listing.create": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "listing.update": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "listing.delete": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "user.create": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "user.delete": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "account.2fa_enable": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "account.2fa_disable": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "account.password_change": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    "login": "Login",
    "logout": "Logout",
    "login.2fa_required": "2FA Required",
    "login.2fa_success": "2FA Passed",
    "login.2fa_failed": "2FA Failed",
    "listing.create": "Created Listing",
    "listing.update": "Updated Listing",
    "listing.delete": "Deleted Listing",
    "listing.publish": "Published",
    "listing.unpublish": "Unpublished",
    "user.create": "Created User",
    "user.update": "Updated User",
    "user.delete": "Deleted User",
    "user.deactivate": "Deactivated User",
    "account.password_change": "Changed Password",
    "account.username_change": "Changed Username",
    "account.2fa_enable": "Enabled 2FA",
    "account.2fa_disable": "Disabled 2FA",
  };
  return map[action] ?? action;
}

function roleColor(role: string): string {
  if (role === "super_admin") return "text-gold-600 dark:text-gold-400";
  if (role === "admin") return "text-blue-600 dark:text-blue-400";
  return "text-primary-600 dark:text-white/70";
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("admin");

  async function fetchLogs(p = 1) {
    setLoading(true);
    const [logsRes, meRes] = await Promise.all([
      fetch(`/api/admin/audit?page=${p}`),
      fetch("/api/auth/me"),
    ]);
    if (logsRes.ok) {
      const data = await logsRes.json();
      setLogs(data.logs ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    }
    if (meRes.ok) {
      const me = await meRes.json();
      setRole(me.user?.role ?? "admin");
    }
    setLoading(false);
  }

  useEffect(() => { fetchLogs(page); }, [page]);

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      <div className="container-page py-8">
        <AdminNav active="audit" role={role as "super_admin" | "admin"} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary-900 dark:text-white flex items-center gap-2">
                <Shield className="h-6 w-6 text-gold-500" /> Audit Log
              </h1>
              <p className="mt-1 text-sm text-primary-500 dark:text-white/60">
                {total} total events — every login, listing change, and account action
              </p>
            </div>
            <button
              onClick={() => fetchLogs(page)}
              className="btn-outline gap-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-primary-400 dark:text-white/40">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-primary-400 dark:text-white/40">
                <ClipboardList className="h-10 w-10 mb-3 opacity-40" />
                <p>No audit log entries yet.</p>
                <p className="text-xs mt-1">Actions will appear here after first login.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-100 dark:border-white/10 text-left text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-white/40">
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-primary-50 dark:border-white/5 hover:bg-primary-50/50 dark:hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-primary-500 dark:text-white/50 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit", second: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${roleColor(log.role)}`}>{log.username}</span>
                          <span className="ml-1.5 text-xs text-primary-400 dark:text-white/30">({log.role.replace("_", " ")})</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_COLORS[log.action] ?? "bg-primary-100 text-primary-600 dark:bg-white/10 dark:text-white/60"}`}>
                            {actionLabel(log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-primary-600 dark:text-white/70 max-w-[200px] truncate">
                          {log.target ?? <span className="text-primary-300 dark:text-white/20">—</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-primary-400 dark:text-white/40">
                          {log.ip ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-primary-500 dark:text-white/60">
                Page {page} of {pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-outline gap-1 text-sm disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="btn-outline gap-1 text-sm disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
