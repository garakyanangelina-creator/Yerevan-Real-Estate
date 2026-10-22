import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPublicProperties } from "@/services/propertyService";

const BASE_URL = "https://www.yerevanreal.com";

const DISTRICTS = [
  "kentron", "arabkir", "avan", "davtashen", "erebuni",
  "malatia-sebastia", "nor-nork", "nork-marash", "nubarashen",
  "shengavit", "kanaker-zeytun", "ajapnyak",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/search", "/submit", "/contact"];
  const entries: MetadataRoute.Sitemap = [];

  const { properties } = await getPublicProperties().catch(() => ({ properties: [] }));

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : 0.7,
      });
    }
    for (const district of DISTRICTS) {
      entries.push({
        url: `${BASE_URL}/${locale}/district/${district}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const property of properties) {
      if (!property.listingCode) continue;
      const code = String(property.listingCode).padStart(4, "0");
      entries.push({
        url: `${BASE_URL}/${locale}/listing/${code}`,
        changeFrequency: "weekly",
        priority: 0.9,
        lastModified: property.updatedAt ? new Date(property.updatedAt) : undefined,
      });
    }
  }

  return entries;
}
