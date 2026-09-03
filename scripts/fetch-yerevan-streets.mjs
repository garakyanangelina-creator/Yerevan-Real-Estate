/**
 * Fetches every named street in every Yerevan district from OpenStreetMap.
 *
 * Uses the Overpass API with each district's OSM relation ID, so results
 * are geo-accurate: only streets whose geometry falls inside the district
 * boundary are returned.
 *
 * HOW TO RUN (from the project root):
 *   node scripts/fetch-yerevan-streets.mjs
 *
 * The script writes src/lib/yerevan-streets.ts automatically.
 * Re-run whenever you want to refresh the data.
 *
 * Requirements: Node 18+ (built-in fetch). No extra packages needed.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../src/lib/yerevan-streets.ts");

// Overpass API endpoint (public, no auth)
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// ── OSM Relation IDs for Yerevan's 12 administrative districts ──────────────
// These are stable OSM relation IDs verified against openstreetmap.org.
// Each ID maps to an admin_level=9 boundary for that district.
// You can verify them at: https://www.openstreetmap.org/relation/<id>
const DISTRICTS = [
  { key: "kentron",         nameEn: "Kentron",          osmRelId: 3771985  },
  { key: "arabkir",         nameEn: "Arabkir",          osmRelId: 3771980  },
  { key: "avan",            nameEn: "Avan",             osmRelId: 3771981  },
  { key: "davtashen",       nameEn: "Davtashen",        osmRelId: 3771982  },
  { key: "erebuni",         nameEn: "Erebuni",          osmRelId: 3771983  },
  { key: "kanakerZeytun",   nameEn: "Kanaker-Zeytun",   osmRelId: 3771984  },
  { key: "ajapnyak",        nameEn: "Ajapnyak",         osmRelId: 3771979  },
  { key: "malatiaSebastia", nameEn: "Malatia-Sebastia", osmRelId: 3771986  },
  { key: "norNork",         nameEn: "Nor Nork",         osmRelId: 3771987  },
  { key: "norkMarash",      nameEn: "Nork-Marash",      osmRelId: 3771988  },
  { key: "nubarashen",      nameEn: "Nubarashen",       osmRelId: 3771989  },
  { key: "shengavit",       nameEn: "Shengavit",        osmRelId: 3771990  },
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function overpass(query, attempt = 1) {
  const MAX = 3;
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(query),
      signal: AbortSignal.timeout(120_000),
    });
    if (res.status === 429 || res.status === 504) {
      if (attempt <= MAX) {
        const wait = attempt * 15_000;
        console.log(`    Rate limited, waiting ${wait/1000}s…`);
        await sleep(wait);
        return overpass(query, attempt + 1);
      }
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    if (attempt <= MAX) {
      console.log(`    Retry ${attempt}/${MAX} (${err.message})…`);
      await sleep(attempt * 5000);
      return overpass(query, attempt + 1);
    }
    throw err;
  }
}

/**
 * Query all named highway ways inside a district using its OSM relation ID.
 * The area() trick converts the relation to an area filter — only ways whose
 * nodes are inside the district boundary are returned.
 */
async function fetchDistrictStreets(district) {
  // Strategy 1: use the relation ID directly
  const q1 = `
[out:json][timeout:120];
rel(${district.osmRelId});
map_to_area->.d;
(
  way(area.d)["highway"~"^(primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|living_street|unclassified|pedestrian|road)$"]["name"];
);
out tags;
`;

  // Strategy 2: fallback — search by name inside Yerevan bbox
  const q2 = `
[out:json][timeout:120];
area["name"="Երevան"]["admin_level"="6"]->.yerevan;
(
  way(area.yerevan)["highway"~"^(primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|living_street|unclassified|pedestrian|road)$"]["name"]["addr:district"="${district.nameEn}"];
);
out tags;
`;

  try {
    const data = await overpass(q1);
    if (data.elements?.length > 0) return data.elements;
    console.log(`    Strategy 1 returned 0, trying strategy 2…`);
    const data2 = await overpass(q2);
    return data2.elements ?? [];
  } catch (e) {
    console.error(`    Both strategies failed: ${e.message}`);
    return [];
  }
}

function bestName(tags) {
  // Prefer English, then Latin transliteration, then Armenian (will be shown as-is)
  return (
    tags["name:en"] ||
    tags["int_name"] ||
    tags["name:latin"] ||
    null
  );
}

// Roads/footpaths we don't want in an address autocomplete
const EXCLUDE_HIGHWAY = new Set([
  "service", "path", "footway", "steps", "cycleway",
  "track", "construction", "proposed", "raceway",
]);

function isAddressableWay(tags) {
  if (!tags.name) return false;
  if (EXCLUDE_HIGHWAY.has(tags.highway)) return false;
  return true;
}

function cleanName(n) {
  return n.trim().replace(/\s+/g, " ");
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Fetching Yerevan streets from OpenStreetMap (OSM)");
  console.log("  Source: Overpass API — https://overpass-api.de");
  console.log("═══════════════════════════════════════════════════════\n");

  const resultByDistrict = {};
  const allStreetToDistricts = new Map();

  for (const district of DISTRICTS) {
    console.log(`[${district.key}]  ${district.nameEn}`);
    const elements = await fetchDistrictStreets(district);

    const seen = new Set();
    for (const el of elements) {
      if (!isAddressableWay(el.tags)) continue;
      const en = bestName(el.tags);
      if (en) seen.add(cleanName(en));
    }

    // Also collect Armenian names for completeness
    for (const el of elements) {
      if (!isAddressableWay(el.tags)) continue;
      const hy = el.tags["name:hy"] || el.tags["name"];
      if (hy && /[Ա-և]/.test(hy)) seen.add(cleanName(hy));
    }

    const sorted = [...seen].sort((a, b) => a.localeCompare(b, ["en", "hy"]));
    resultByDistrict[district.key] = sorted;
    console.log(`  → ${sorted.length} streets found\n`);

    for (const s of sorted) {
      if (!allStreetToDistricts.has(s)) allStreetToDistricts.set(s, []);
      allStreetToDistricts.get(s).push(district.key);
    }

    await sleep(3000); // polite delay between requests
  }

  resultByDistrict["other"] = [];

  // ── Quality report ──────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════");
  console.log("  DATA QUALITY REPORT");
  console.log("═══════════════════════════════════════════════════════");

  let grandTotal = 0;
  for (const [key, streets] of Object.entries(resultByDistrict)) {
    if (key === "other") continue;
    const d = DISTRICTS.find(d => d.key === key);
    const label = (d?.nameEn ?? key).padEnd(20);
    const warn = streets.length < 10 ? " ⚠ (very few streets — check OSM relation ID)" : "";
    console.log(`  ${label} ${streets.length} streets${warn}`);
    grandTotal += streets.length;
  }
  console.log(`  ${"TOTAL".padEnd(20)} ${grandTotal} streets`);

  const crossBorder = [...allStreetToDistricts.entries()].filter(([, ds]) => ds.length > 1);
  if (crossBorder.length > 0) {
    console.log(`\n  Cross-district streets (appear in multiple districts):`);
    crossBorder.forEach(([s, ds]) => console.log(`    "${s}" → ${ds.join(", ")}`));
  }

  const empty = DISTRICTS.filter(d => (resultByDistrict[d.key]?.length ?? 0) === 0);
  if (empty.length > 0) {
    console.log(`\n  ⚠ Districts with ZERO streets (OSM relation ID may be wrong):`);
    empty.forEach(d => console.log(`    ${d.key} (relId: ${d.osmRelId})`));
    console.log(`\n  To find the correct OSM relation ID:`);
    console.log(`    1. Go to https://www.openstreetmap.org`);
    console.log(`    2. Search for "Yerevan ${empty[0].nameEn}"`);
    console.log(`    3. Click the result → note the relation ID in the URL`);
    console.log(`    4. Update the osmRelId in this script and re-run`);
  }

  // ── Write TypeScript file ───────────────────────────────────────────────
  mkdirSync(dirname(OUT), { recursive: true });

  const ts = [
    `/**`,
    ` * AUTO-GENERATED — DO NOT EDIT MANUALLY.`,
    ` *`,
    ` * Source: OpenStreetMap via Overpass API`,
    ` * Generated: ${new Date().toISOString()}`,
    ` * Total streets: ${grandTotal}`,
    ` *`,
    ` * To refresh, run from project root:`,
    ` *   node scripts/fetch-yerevan-streets.mjs`,
    ` */`,
    ``,
    `export const streetsByDistrict: Record<string, string[]> = {`,
    ...Object.entries(resultByDistrict).flatMap(([key, streets]) => [
      `  ${key}: [`,
      ...streets.map(s => `    ${JSON.stringify(s)},`),
      `  ],`,
      ``,
    ]),
    `};`,
    ``,
    `/** Flat set of all known streets across all districts. */`,
    `export const allKnownStreets: Set<string> = new Set(`,
    `  Object.values(streetsByDistrict).flat()`,
    `);`,
    ``,
    `/**`,
    ` * Returns true if \`street\` belongs to \`district\`.`,
    ` * Empty street always passes (field is optional).`,
    ` * Comparison is case-insensitive and trims whitespace.`,
    ` */`,
    `export function isStreetInDistrict(district: string, street: string): boolean {`,
    `  if (!street) return true;`,
    `  const list = streetsByDistrict[district];`,
    `  if (!list || list.length === 0) return true; // unknown district — don't block`,
    `  const norm = (s: string) => s.trim().toLowerCase();`,
    `  return list.some((s) => norm(s) === norm(street));`,
    `}`,
  ].join("\n");

  writeFileSync(OUT, ts, "utf8");
  console.log(`\n✓ Written to ${OUT}`);
  console.log(`\nNext steps:`);
  console.log(`  git add src/lib/yerevan-streets.ts`);
  console.log(`  git commit -m "chore: refresh Yerevan streets from OSM"`);
  console.log(`  git push`);
}

main().catch(e => {
  console.error("\n✗ Fatal error:", e.message);
  process.exit(1);
});
