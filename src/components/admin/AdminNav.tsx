"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, LogOut, Users, LayoutDashboard } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";

interface AdminNotification {
  id: string;
  propertyId: string;
  propertyTitle: string;
  matchCount: number;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNav({ active }: { active: "dashboard" | "clients" }) {
  const t = useTranslations("admin");
  const tNotif = useTranslations("notifications");
  const router = useRouter();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  async function viewMatches(notification: AdminNotification) {
    await fetch(`/api/admin/notifications/${notification.id}/read`, { method: "POST" });
    setOpen(false);
    router.push(`/admin/dashboard?matchesFor=${notification.propertyId}`);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <div className="flex items-center justify-between border-b border-primary-100 pb-4 dark:border-white/10">
      <nav className="flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-1.5 text-sm font-medium ${
            active === "dashboard" ? "text-gold-600" : "text-primary-600 dark:text-white/70"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" /> {t("dashboard")}
        </Link>
        <Link
          href="/admin/clients"
          className={`flex items-center gap-1.5 text-sm font-medium ${
            active === "clients" ? "text-gold-600" : "text-primary-600 dark:text-white/70"
          }`}
        >
          <Users className="h-4 w-4" /> {t("clients")}
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={tNotif("title")}
            className="relative rounded-full border border-primary-200 p-2 text-primary-700 dark:border-white/20 dark:text-white"
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
                <span className="text-sm font-semibold text-primary-900 dark:text-white">{tNotif("title")}</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-gold-600 hover:underline">
                    {tNotif("markAllRead")}
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-primary-500 dark:text-white/60">{tNotif("empty")}</p>
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
                      <p className="mt-0.5 text-xs text-gold-600">{tNotif("newPropertyMatches", { count: n.matchCount })}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button onClick={logout} className="btn-outline">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </button>
      </div>
    </div>
  );
}
