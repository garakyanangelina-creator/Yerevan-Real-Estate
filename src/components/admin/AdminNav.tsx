"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Users, LayoutDashboard, ShieldAlert, KeyRound, X, MessageSquare, Shield, ClipboardList, QrCode, ShieldCheck, ShieldOff } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";

interface AdminNotification {
  id: string;
  propertyId: string;
  propertyTitle: string;
  matchCount: number;
  isRead: boolean;
  createdAt: string;
}

type ActiveTab = "dashboard" | "clients" | "users" | "contacts" | "audit";

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
  const [notifOpen, setNotifOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"password" | "username" | "2fa">("password");

  // Password/username form state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [unForm, setUnForm] = useState({ newUsername: "", password: "" });
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [twoFaEnabled, setTwoFaEnabled] = useState<boolean | null>(null);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [qrSecret, setQrSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [disableForm, setDisableForm] = useState({ password: "", code: "" });

  function clearMsg() { setMsg(null); }

  async function changePassword() {
    clearMsg();
    if (pwForm.next !== pwForm.confirm) { setMsg({ text: "Passwords don't match", ok: false }); return; }
    if (pwForm.next.length < 8) { setMsg({ text: "Min 8 characters", ok: false }); return; }
    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    setLoading(false);
    if (res.ok) { setPwForm({ current: "", next: "", confirm: "" }); setMsg({ text: "Password changed.", ok: true }); }
    else { const d = await res.json(); setMsg({ text: d.error ?? "Error", ok: false }); }
  }

  async function changeUsername() {
    clearMsg();
    if (!unForm.newUsername.trim() || !unForm.password) { setMsg({ text: "All fields required", ok: false }); return; }
    setLoading(true);
    const res = await fetch("/api/auth/change-username", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newUsername: unForm.newUsername.trim(), password: unForm.password }),
    });
    setLoading(false);
    if (res.ok) { setUnForm({ newUsername: "", password: "" }); setMsg({ text: "Username changed.", ok: true }); }
    else { const d = await res.json(); setMsg({ text: d.error ?? "Error", ok: false }); }
  }

  async function load2FaStatus() {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setTwoFaEnabled(data.user?.totpEnabled ?? false);
    }
  }

  async function start2FaSetup() {
    clearMsg(); setLoading(true);
    const res = await fetch("/api/auth/2fa/setup");
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setQrUri(data.uri);
      setQrSecret(data.secret);
    } else {
      const d = await res.json();
      setMsg({ text: d.error ?? "Error", ok: false });
    }
  }

  async function verify2Fa() {
    clearMsg(); setLoading(true);
    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: totpCode }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg({ text: "2FA enabled! Your account is now protected.", ok: true });
      setQrUri(null); setQrSecret(null); setTotpCode("");
      setTwoFaEnabled(true);
    } else {
      const d = await res.json();
      setMsg({ text: d.error ?? "Invalid code", ok: false });
    }
  }

  async function disable2Fa() {
    clearMsg(); setLoading(true);
    const res = await fetch("/api/auth/2fa/disable", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: disableForm.password, code: disableForm.code }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg({ text: "2FA disabled.", ok: true });
      setDisableForm({ password: "", code: "" });
      setTwoFaEnabled(false);
    } else {
      const d = await res.json();
      setMsg({ text: d.error ?? "Error", ok: false });
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
    if (showSettings && settingsTab === "2fa" && twoFaEnabled === null) {
      load2FaStatus();
    }
  }, [showSettings, settingsTab]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setNotifOpen(false);
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
    setNotifOpen(false);
    router.push(`/admin/dashboard?matchesFor=${n.propertyId}`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  }

  function openSettings(tab: typeof settingsTab = "password") {
    setSettingsTab(tab); clearMsg(); setShowSettings(true);
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

  const inputCls = "w-full rounded-lg border border-white/20 bg-primary-700 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-gold-400 focus:outline-none";
  const tabBtn = (t: typeof settingsTab, label: string) => (
    <button
      onClick={() => { setSettingsTab(t); clearMsg(); }}
      className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${settingsTab === t ? "bg-gold-500 text-primary-900" : "bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-white/70"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between border-b border-primary-100 pb-4 dark:border-white/10">
      <nav className="flex items-center gap-5 flex-wrap">
        {navLink("/admin/dashboard", "dashboard", LayoutDashboard, "Dashboard")}
        {navLink("/admin/clients", "clients", Users, "Clients")}
        {navLink("/admin/contacts", "contacts", MessageSquare, "Contacts")}
        {role === "super_admin" && navLink("/admin/users", "users", ShieldAlert, "Users")}
        {navLink("/admin/audit", "audit", ClipboardList, "Audit Log")}
      </nav>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-500 dark:bg-white/10 dark:text-white/60 sm:block">
          {role === "super_admin" ? "Super Admin" : "Admin"}
        </span>

        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
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
          {notifOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/10 dark:bg-primary-800">
              <div className="flex items-center justify-between border-b border-primary-100 px-4 py-2 dark:border-white/10">
                <span className="text-sm font-semibold text-primary-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-gold-600 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-primary-500 dark:text-white/60">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button key={n.id} onClick={() => viewMatches(n)}
                      className={`block w-full border-b border-primary-50 px-4 py-3 text-left text-sm hover:bg-primary-50 dark:border-white/5 dark:hover:bg-white/5 ${n.isRead ? "text-primary-500 dark:text-white/50" : "font-medium text-primary-900 dark:text-white"}`}
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

        <button onClick={() => openSettings("password")} className="btn-outline gap-2 text-sm">
          <KeyRound className="h-4 w-4" /> Settings
        </button>
        <button onClick={logout} className="btn-outline gap-2 text-sm">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Account Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-primary-800 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-primary-900 dark:text-white">Account Settings</h2>
              <button onClick={() => { setShowSettings(false); clearMsg(); setQrUri(null); setQrSecret(null); }}
                className="text-primary-400 hover:text-primary-700 dark:text-white/50 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              {tabBtn("password", "Password")}
              {tabBtn("username", "Username")}
              {tabBtn("2fa", "2FA")}
            </div>

            {msg && (
              <p className={`mb-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                {msg.text}
              </p>
            )}

            {settingsTab === "password" && (
              <div className="space-y-3">
                <input type="password" placeholder="Current password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} className={inputCls} />
                <input type="password" placeholder="New password (min 8 chars)" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} className={inputCls} />
                <input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className={inputCls} />
                <button onClick={changePassword} disabled={loading} className="btn-primary w-full">{loading ? "Saving…" : "Save Password"}</button>
              </div>
            )}

            {settingsTab === "username" && (
              <div className="space-y-3">
                <input type="text" placeholder="New username" value={unForm.newUsername} onChange={e => setUnForm(f => ({ ...f, newUsername: e.target.value }))} className={inputCls} autoComplete="off" />
                <input type="password" placeholder="Confirm with your password" value={unForm.password} onChange={e => setUnForm(f => ({ ...f, password: e.target.value }))} className={inputCls} />
                <button onClick={changeUsername} disabled={loading} className="btn-primary w-full">{loading ? "Saving…" : "Save Username"}</button>
              </div>
            )}

            {settingsTab === "2fa" && (
              <div className="space-y-4">
                {twoFaEnabled === null && (
                  <p className="text-sm text-primary-500 dark:text-white/60">Loading…</p>
                )}

                {twoFaEnabled === false && !qrUri && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-primary-50 p-3 dark:bg-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-gold-500" />
                        <span className="text-sm font-semibold text-primary-900 dark:text-white">Two-Factor Authentication</span>
                      </div>
                      <p className="text-xs text-primary-500 dark:text-white/60">
                        Add an extra layer of security. After enabling, you&apos;ll need your phone to log in.
                      </p>
                    </div>
                    <button onClick={start2FaSetup} disabled={loading} className="btn-primary w-full gap-2">
                      <QrCode className="h-4 w-4" /> {loading ? "Loading…" : "Enable 2FA"}
                    </button>
                  </div>
                )}

                {twoFaEnabled === false && qrUri && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-primary-900 dark:text-white">
                      1. Install <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone.
                    </p>
                    <p className="text-sm text-primary-600 dark:text-white/70">2. Scan this QR code:</p>
                    <div className="flex justify-center rounded-xl bg-white p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUri)}`}
                        alt="2FA QR Code"
                        width={180}
                        height={180}
                      />
                    </div>
                    {qrSecret && (
                      <div className="rounded-lg bg-primary-50 p-2 dark:bg-white/10">
                        <p className="text-xs text-primary-500 dark:text-white/50 mb-1">Manual entry key:</p>
                        <p className="font-mono text-xs break-all text-primary-800 dark:text-white select-all">{qrSecret}</p>
                      </div>
                    )}
                    <p className="text-sm text-primary-600 dark:text-white/70">3. Enter the 6-digit code:</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      maxLength={6}
                      value={totpCode}
                      onChange={e => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      className={inputCls + " text-center tracking-widest text-lg"}
                    />
                    <button onClick={verify2Fa} disabled={loading || totpCode.length !== 6} className="btn-primary w-full gap-2">
                      <ShieldCheck className="h-4 w-4" /> {loading ? "Verifying…" : "Activate 2FA"}
                    </button>
                  </div>
                )}

                {twoFaEnabled === true && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">2FA is Active</span>
                      </div>
                      <p className="mt-1 text-xs text-green-600 dark:text-green-500">Your account requires an authenticator code to log in.</p>
                    </div>
                    <p className="text-sm font-medium text-primary-800 dark:text-white">To disable 2FA:</p>
                    <input type="password" placeholder="Your password" value={disableForm.password} onChange={e => setDisableForm(f => ({ ...f, password: e.target.value }))} className={inputCls} />
                    <input type="text" inputMode="numeric" placeholder="Authenticator code" maxLength={6} value={disableForm.code} onChange={e => setDisableForm(f => ({ ...f, code: e.target.value.replace(/\D/g, "") }))} className={inputCls + " tracking-widest"} />
                    <button onClick={disable2Fa} disabled={loading} className="w-full rounded-lg border border-red-400 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center justify-center gap-2">
                      <ShieldOff className="h-4 w-4" /> {loading ? "Disabling…" : "Disable 2FA"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
