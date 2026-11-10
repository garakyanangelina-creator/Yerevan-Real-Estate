export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicProperties } from "@/services/propertyService";
import SearchClient from "./SearchClient";

const SITE_URL = "https://www.yerevanreal.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `${SITE_URL}/${locale}/search`,
      languages: {
        en: `${SITE_URL}/en/search`,
        ru: `${SITE_URL}/ru/search`,
        hy: `${SITE_URL}/hy/search`,
        "x-default": `${SITE_URL}/en/search`,
      },
    },
  };
}

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
