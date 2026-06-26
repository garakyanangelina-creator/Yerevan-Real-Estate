import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPublicProperties } from "@/services/propertyService";

const BASE_URL = "https://yerevanrealestate.am";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/search", "/submit", "/contact"];
  const entries: MetadataRoute.Sitemap = [];

  // Best-effort: if Apify is unreachable at build/request time, still emit the
  // static routes rather than failing the whole sitemap.
  const { properties } = await getPublicProperties().catch(() => ({ properties: [] }));

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({ url: `${BASE_URL}/${locale}${path}` });
    }
    for (const property of properties) {
      entries.push({ url: `${BASE_URL}/${locale}/property/${property.id}` });
    }
  }

  return entries;
}
