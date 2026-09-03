"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import {
  Users, LayoutDashboard, Building2,
  UserCheck, UserCog, Eye, EyeOff,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AdminNav from "@/components/admin/AdminNav";
import MatchingClientsModal from "@/components/admin/MatchingClientsModal";

interface DbListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  purpose: string;
  district: string;
  status: string;
  isPublished: boolean;
  createdAt: string;
  createdBy: { username: string };
}

interface UserRow {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-700/50">
        <Icon className="h-5 w-5 text-gold-500" />
      </div>
      <div>
        <p className="text-2xl font-bold text-primary-900 dark:text-white">{value}</p>
        <p className="text-sm text-primary-500 dark:text-white/60">{label}</p>
        {sub && <p className="text-xs text-primary-400 dark:text-white/40">{sub}</p>}
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<string | null>(null);
  const [dbListings, setDbListings] = useState<DbListing[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [matchesFor, setMatchesFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function togglePublish(l: DbListing) {
    setToggling(l.id);
    await fetch(`/api/employee/listings/${l.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !l.isPublished }),
    });
    setDbListings((prev) => prev.map((x) => x.id === l.id ? { ...x, isPublished: !l.isPublished } : x));
    setToggling(null);
  }

  useEffect(() => {
    const fromQuery = searchParams.get("matchesFor");
    if (fromQuery) setMatchesFor(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const listingsRes = await fetch("/api/employee/listings");

        if (listingsRes.status === 401) {
          router.replace("/admin");
          return;
        }

        const listingsData = listingsRes.ok ? await listingsRes.json() : { listings: [] };

        if (!active) return;
        setDbListings(listingsData.listings ?? []);

        // Detect role from session (super_admin gets users list)
        const usersRes = await fetch("/api/super-admin/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users ?? []);
          setRole("super_admin");
        } else {
          setRole("admin");
        }
      } catch {
        if (active) router.replace("/admin");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [router]);

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === "admin" && u.isActive).length;
  const employeeCount = users.filter(u => u.role === "employee" && u.isActive).length;

  return (
    <div className="container-page py-10">
      <AdminNav active="dashboard" role={role ?? "admin"} />

      <div className="mt-6 flex items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
          Dashboard
        </h1>
        <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-700 dark:bg-gold-900/30 dark:text-gold-300">
          {role === "super_admin" ? "Super Admin" : "Admin"}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Total Listings" value={dbListings.length} sub={`${dbListings.filter(l => l.isPublished).length} published`} />
        {role === "super_admin" && (
          <>
            <StatCard icon={UserCog} label="Admins" value={adminCount} />
            <StatCard icon={UserCheck} label="Employees" value={employeeCount} />
          </>
        )}
      </div>

      {/* Employee-created listings */}
      {dbListings.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-serif text-xl font-semibold text-primary-900 dark:text-white">
            Employee Listings
          </h2>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-primary-100 dark:border-white/10">
                <tr className="text-primary-500 dark:text-white/60">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Publish</th>
                </tr>
              </thead>
              <tbody>
                {dbListings.map((l) => (
                  <tr key={l.id} className="border-b border-primary-50 dark:border-white/5">
                    <td className="px-4 py-3 font-medium text-primary-800 dark:text-white">{l.title}</td>
                    <td className="px-4 py-3">
                      {formatPrice(l.price, l.purpose as "sale" | "rent", l.currency)}
                    </td>
                    <td className="px-4 py-3 capitalize">{l.district}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        l.status === "available"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : l.status === "sold"
                          ? "bg-primary-100 text-primary-700 dark:bg-primary-700/30 dark:text-white/60"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primary-500 dark:text-white/60">{l.createdBy.username}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(l)}
                        disabled={toggling === l.id}
                        title={l.isPublished ? "Unpublish" : "Publish to website"}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                          l.isPublished
                            ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-primary-100 text-primary-500 hover:bg-gold-100 hover:text-gold-700 dark:bg-white/10 dark:text-white/50"
                        }`}
                      >
                        {l.isPublished ? <><Eye className="h-3 w-3" /> Published</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {matchesFor && (
        <MatchingClientsModal propertyId={matchesFor} onClose={() => setMatchesFor(null)} />
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
