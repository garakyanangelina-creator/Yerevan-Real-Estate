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
