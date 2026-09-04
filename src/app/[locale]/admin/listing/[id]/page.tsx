"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import StaffListingView, { type StaffListing } from "@/components/staff/StaffListingView";
import { Building2 } from "lucide-react";

export default function AdminListingPage() {
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<StaffListing | null>(null);
  const [role, setRole] = useState<string>("admin");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      // Detect role
      const usersRes = await fetch("/api/super-admin/users");
      if (usersRes.ok) setRole("super_admin");

      const res = await fetch(`/api/employee/listings/${params.id}`);
      if (res.status === 401) { router.push(`/${params.locale}/admin`); return; }
      if (res.status === 404) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      const l = data.listing;
      let amenities: Record<string, unknown> = {};
      try { amenities = JSON.parse(l.amenities ?? "{}"); } catch {}
      let images: string[] = [];
      try { images = JSON.parse(l.images ?? "[]"); } catch {}
      setListing({
        ...l,
        images,
        amenities,
        createdAt: l.createdAt,
        createdBy: l.createdBy ?? { username: "—" },
        listingCode: l.listingCode ?? null,
      });
      setLoading(false);
    }
    load();
  }, [params.id, params.locale, router]);

  async function handleDelete() {
    if (!listing || !confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    await fetch(`/api/employee/listings/${listing.id}`, { method: "DELETE" });
    router.push(`/${params.locale}/admin/dashboard`);
  }

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="h-64 w-full skeleton rounded-2xl" />
        <div className="mt-8 space-y-4">
          <div className="h-8 w-64 skeleton rounded-lg" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <Building2 className="h-12 w-12 text-primary-200" />
        <p className="text-primary-500">Listing not found.</p>
      </div>
    );
  }

  return (
    <StaffListingView
      listing={listing}
      backHref={`/${params.locale}/admin/dashboard`}
      role={role}
      onDelete={handleDelete}
    />
  );
}
