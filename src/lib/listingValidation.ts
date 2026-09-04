/** Allowed enum values for listing fields — validated server-side on create and update. */

export const ALLOWED_TYPES = new Set(["apartment", "house", "commercial", "land", "villa", "studio", "penthouse"]);
export const ALLOWED_PURPOSES = new Set(["sale", "rent"]);
export const ALLOWED_DISTRICTS = new Set([
  "kentron", "arabkir", "avan", "davtashen", "erebuni",
  "malatia-sebastia", "nor-nork", "nork-marash", "nubarashen",
  "shengavit", "kanaker-zeytun", "ajapnyak", "other",
]);
export const ALLOWED_CURRENCIES = new Set(["AMD", "USD", "EUR", "RUB"]);
export const ALLOWED_STATUSES = new Set(["active", "available", "sold", "rented", "inactive", "pending"]);

export function sanitizeImageUrls(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .filter((u): u is string => typeof u === "string")
    .map((u) => u.trim())
    .filter((u) => {
      try {
        const parsed = new URL(u);
        // Only allow https URLs pointing to known storage domains or data URIs
        return parsed.protocol === "https:" && u.length < 2000;
      } catch {
        return false;
      }
    })
    .slice(0, 30); // cap at 30 images
}
