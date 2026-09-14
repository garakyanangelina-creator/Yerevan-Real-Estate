// Force dynamic rendering so getPublicProperties() runs on every request
// rather than being cached at build time (when the DB may be empty).
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getPublicProperties } from "@/services/propertyService";
import SearchClient from "./SearchClient";

export default async function SearchPage() {
  const { properties, error } = await getPublicProperties();

  return (
    <Suspense fallback={null}>
      <SearchClient initialProperties={properties} initialError={error} />
    </Suspense>
  );
}
