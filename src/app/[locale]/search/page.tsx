export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getPublicProperties } from "@/services/propertyService";
import SearchClient from "./SearchClient";

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { properties, error } = await getPublicProperties(locale);

  return (
    <Suspense fallback={null}>
      <SearchClient initialProperties={properties} initialError={error} />
    </Suspense>
  );
}
