"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Users, LayoutDashboard, ShieldAlert, KeyRound, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";

interface AdminNotification {
  id: string;
  propertyId: string;
  propertyTitle: string;
  matchCount: number;
  isRead: boolean;
  createdAt: string;
}

type ActiveTab = "dashboard" | "clients" | "users";

export default function AdminNav({
  active,
  role,
}: {
  active: ActiveTab;
  role: "super_admin" | "admin" | string;
}) {
  const router = useRouter();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function changePassword() {
    setPwError("");
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match"); return; }
    if (pwForm.next.length < 6) { setPwError("Min 6 characters"); return; }
    setPwLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    setPwLoading(false);
    if (res.ok) {
      setShowChangePw(false);
      setPwForm({ current: "", next: "", confirm: "" });
    } else {
      const d = await res.json();
      setPwError(d.error ?? "Error");
    }
  }

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    await fetch("/api/admin/notifications/read-all", { method: "POST" });
    setUnreadCount(0);
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
  }

  async function viewMatches(n: AdminNotification) {
    await fetch(`/api/admin/notifications/${n.id}/read`, { method: "POST" });
    setOpen(false);
    router.push(`/admin/dashboard?matchesFor=${n.propertyId}`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  }

  const navLink = (href: string, tab: ActiveTab, icon: React.ElementType, label: string) => {
    const Icon = icon;
    const isActive = active === tab;
    return (
      <Link
        href={href as "/admin/dashboard"}
        className={`flex items-center gap-1.5 text-sm font-medium transition ${
          isActive ? "text-gold-600" : "text-primary-600 hover:text-primary-900 dark:text-white/70 dark:hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4" /> {label}
      </Link>
    );
  };

  return (
    <div className="flex items-center justify-between border-b border-primary-100 pb-4 dark:border-white/10">
      <nav className="flex items-center gap-5">
        {navLink("/admin/dashboard", "dashboard", LayoutDashboard, "Dashboard")}
        {navLink("/admin/clients", "clients", Users, "Clients")}
        {role === "super_admin" &&
          navLink("/admin/users", "users", ShieldAlert, "Users")}
      </nav>

      <div className="flex items-center gap-2">
        {/* Role badge */}
        <span className="hidden rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-500 dark:bg-white/10 dark:text-white/60 sm:block">
          {role === "super_admin" ? "Super Admin" : "Admin"}
        </span>

        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Notifications"
            className="relative rounded-full border border-primary-200 p-2 text-primary-700 transition hover:bg-primary-50 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold text-primary-900">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/10 dark:bg-primary-800">
              <div className="flex items-center justify-between border-b border-primary-100 px-4 py-2 dark:border-white/10">
                <span className="text-sm font-semibold text-primary-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-gold-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-primary-500 dark:text-white/60">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => viewMatches(n)}
                      className={`block w-full border-b border-primary-50 px-4 py-3 text-left text-sm hover:bg-primary-50 dark:border-white/5 dark:hover:bg-white/5 ${
                        n.isRead ? "text-primary-500 dark:text-white/50" : "font-medium text-primary-900 dark:text-white"
                      }`}
                    >
                      <p className="line-clamp-1">{n.propertyTitle}</p>
                      <p className="mt-0.5 text-xs text-gold-600">{n.matchCount} matching clients</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setShowChangePw(true)} className="btn-outline gap-2 text-sm">
          <KeyRound className="h-4 w-4" /> Password
        </button>

        <button onClick={logout} className="btn-outline gap-2 text-sm">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {showChangePw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-primary-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-primary-900 dark:text-white">Change Password</h2>
              <button onClick={() => setShowChangePw(false)} className="text-primary-400 hover:text-primary-700 dark:text-white/50 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="password" placeholder="Current password" value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                className="input w-full"
              />
              <input
                type="password" placeholder="New password" value={pwForm.next}
                onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                className="input w-full"
              />
              <input
                type="password" placeholder="Confirm new password" value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                className="input w-full"
              />
              {pwError && <p className="text-sm text-red-500">{pwError}</p>}
              <button onClick={changePassword} disabled={pwLoading} className="btn-primary w-full">
                {pwLoading ? "Saving…" : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
