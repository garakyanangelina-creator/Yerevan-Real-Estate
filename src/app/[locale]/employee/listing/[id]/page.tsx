"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import StaffListingView, { type StaffListing } from "@/components/staff/StaffListingView";
import { Building2 } from "lucide-react";

export default function EmployeeListingPage() {
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<(StaffListing & { amenitiesRaw?: string }) | null>(null);
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/employee/listings/${params.id}`);
      if (res.status === 401) { router.push(`/${params.locale}/admin`); return; }
      if (res.status === 403 || res.status === 404) { setNotFound(true); setLoading(false); return; }
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

  function handleEdit() {
    router.push(`/${params.locale}/employee/dashboard`);
  }

  async function handleDelete() {
    if (!listing || !confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    await fetch(`/api/employee/listings/${listing.id}`, { method: "DELETE" });
    router.push(`/${params.locale}/employee/dashboard`);
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
        <p className="text-primary-500">Listing not found or access denied.</p>
      </div>
    );
  }

  return (
    <StaffListingView
      listing={listing}
      backHref={`/${params.locale}/employee/dashboard`}
      role={role}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
