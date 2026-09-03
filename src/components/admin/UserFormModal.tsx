"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

interface UserRow {
  id: string;
  username: string;
  email: string | null;
  role: string;
  isActive: boolean;
}

interface Props {
  mode: "create" | "edit";
  user?: UserRow;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserFormModal({ mode, user, onClose, onSaved }: Props) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState(user?.role ?? "employee");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "create" && !password) {
      setError("Password is required");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    const payload: Record<string, unknown> = { role, email: email || null, username: username.trim() };
    if (mode === "create") {
      payload.password = password;
    }
    if (mode === "edit" && password) {
      payload.password = password;
    }

    const url = mode === "create" ? "/api/super-admin/users" : `/api/super-admin/users/${user!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "An error occurred");
    }
  }

  const inputCls = "w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-700 dark:text-white";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-white/60 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-primary-900 dark:text-white">
            {mode === "create" ? "Create New User" : `Edit: ${user?.username}`}
          </h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-primary-50 dark:hover:bg-white/10">
            <X className="h-5 w-5 text-primary-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={labelCls}>Username *</label>
            <input
              required
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              placeholder="e.g. john_smith"
              disabled={mode === "edit" ? false : false}
            />
          </div>

          <div>
            <label className={labelCls}>Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className={labelCls}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>
              {mode === "create" ? "Password *" : "New Password (leave blank to keep current)"}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Min. 8 characters"
            />
          </div>

          {password && (
            <div>
              <label className={labelCls}>Confirm Password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Saving…" : mode === "create" ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
