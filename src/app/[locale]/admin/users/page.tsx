"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { UserPlus, Pencil, Trash2, ShieldAlert, UserCheck, UserCog, Power } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import UserFormModal from "@/components/admin/UserFormModal";

interface UserRow {
  id: string;
  username: string;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  super_admin: { label: "Super Admin", icon: ShieldAlert, color: "text-red-500" },
  admin: { label: "Admin", icon: UserCog, color: "text-gold-600" },
  employee: { label: "Employee", icon: UserCheck, color: "text-primary-600 dark:text-white/70" },
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; user?: UserRow } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchUsers() {
    const res = await fetch("/api/super-admin/users");
    if (res.status === 401 || res.status === 403) {
      router.replace("/admin/dashboard");
      return;
    }
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleToggleActive(user: UserRow) {
    await fetch(`/api/super-admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    await fetchUsers();
  }

  async function handleDelete(user: UserRow) {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    setDeleting(user.id);
    const res = await fetch(`/api/super-admin/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Delete failed");
    }
    setDeleting(null);
    await fetchUsers();
  }

  return (
    <div className="container-page py-10">
      <AdminNav active="users" role="super_admin" />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
          User Management
        </h1>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="btn-primary gap-2"
        >
          <UserPlus className="h-4 w-4" /> New User
        </button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      ) : (
        <div className="mt-8 card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary-100 dark:border-white/10">
              <tr className="text-primary-500 dark:text-white/60">
                <th className="px-5 py-3">Username</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const meta = ROLE_LABELS[user.role] ?? ROLE_LABELS.employee;
                const Icon = meta.icon;
                return (
                  <tr key={user.id} className="border-b border-primary-50 last:border-0 dark:border-white/5">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 font-medium text-primary-900 dark:text-white">
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                        {user.username}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-primary-500 dark:text-white/60">
                      {user.email || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-primary-100 text-primary-500 dark:bg-primary-700/30 dark:text-white/40"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-primary-400 dark:text-white/40">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal({ mode: "edit", user })}
                          title="Edit / Reset Password"
                          className="rounded p-1.5 text-primary-500 hover:bg-primary-50 hover:text-primary-800 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          title={user.isActive ? "Deactivate" : "Activate"}
                          className="rounded p-1.5 text-primary-500 hover:bg-primary-50 dark:text-white/50 dark:hover:bg-white/10"
                        >
                          <Power className={`h-4 w-4 ${user.isActive ? "text-green-500" : "text-primary-400"}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deleting === user.id}
                          title="Delete"
                          className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <UserFormModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
}
