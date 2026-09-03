/**
 * Fetches every named street in every Yerevan district from OpenStreetMap.
 * Run: node scripts/fetch-yerevan-streets.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../src/lib/yerevan-streets.ts");

const MIRRORS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

// OSM relation IDs verified from nominatim.openstreetmap.org + openstreetmap.org
const DISTRICTS = [
  { key: "kentron",         nameEn: "Kentron",          osmRelId: 13404218 },
  { key: "arabkir",         nameEn: "Arabkir",          osmRelId: 13404297 },
  { key: "avan",            nameEn: "Avan",             osmRelId: 13404250 },
  { key: "davtashen",       nameEn: "Davtashen",        osmRelId: 13404298 },
  { key: "erebuni",         nameEn: "Erebuni",          osmRelId: 13404216 },
  { key: "kanakerZeytun",   nameEn: "Kanaker-Zeytun",   osmRelId: 13404296 },
  { key: "ajapnyak",        nameEn: "Ajapnyak",         osmRelId: 13404299 },
  { key: "malatiaSebastia", nameEn: "Malatia-Sebastia", osmRelId: 13404219 },
  { key: "norNork",         nameEn: "Nor Nork",         osmRelId: 13404220 },
  { key: "norkMarash",      nameEn: "Nork-Marash",      osmRelId: 13404217 },
  { key: "nubarashen",      nameEn: "Nubarashen",       osmRelId: 13404214 },
  { key: "shengavit",       nameEn: "Shengavit",        osmRelId: 13404215 },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function query(q) {
  for (const mirror of MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(q),
        signal: AbortSignal.timeout(90_000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.elements !== undefined) return data;
    } catch {}
    await sleep(1000);
  }
  return { elements: [] };
}

async function main() {
  console.log("Fetching Yerevan streets from OpenStreetMap...\n");
  console.log("Using verified OSM relation IDs from nominatim.openstreetmap.org\n");

  const result = {};

  for (const district of DISTRICTS) {
    const relId = district.osmRelId;
    console.log(`[${district.key}] ${district.nameEn} (relation ${relId})...`);

    const areaId = 3600000000 + relId;
    const hwFilter = `["highway"~"^(primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|living_street|unclassified|pedestrian|road)$"]["name"]`;

    const q1 = `[out:json][timeout:120];\nrel(${relId});\nmap_to_area->.d;\n(\n  way(area.d)${hwFilter};\n);\nout tags;`;
    const q2 = `[out:json][timeout:120];\n(\n  way(area:${areaId})${hwFilter};\n);\nout tags;`;

    function extractNames(data) {
      const s = new Set();
      for (const el of data.elements) {
        const en = el.tags["name:en"] || el.tags["int_name"];
        const hy = el.tags["name:hy"] || el.tags["name"];
        if (en) s.add(en.trim());
        else if (hy) s.add(hy.trim());
      }
      return s;
    }

    const d1 = await query(q1);
    const names1 = extractNames(d1);
    await sleep(2000);
    const d2 = await query(q2);
    const names2 = extractNames(d2);
    await sleep(2000);

    // Use whichever method returned more streets
    const best = names1.size >= names2.size ? names1 : names2;
    const sorted = [...best].sort((a, b) => a.localeCompare(b));
    result[district.key] = sorted;
    console.log(`  → ${sorted.length} streets (method1=${names1.size} method2=${names2.size})`);
  }

  result["other"] = [];

  // Summary
  let total = 0;
  console.log("\n=== SUMMARY ===");
  for (const [k, streets] of Object.entries(result)) {
    if (k === "other") continue;
    console.log(`  ${k.padEnd(20)} ${streets.length} streets`);
    total += streets.length;
  }
  console.log(`  ${"TOTAL".padEnd(20)} ${total} streets`);

  // Write file
  mkdirSync(dirname(OUT), { recursive: true });
  const ts = [
    `/**`,
    ` * AUTO-GENERATED from OpenStreetMap via Overpass API.`,
    ` * Generated: ${new Date().toISOString()} — Total: ${total} streets`,
    ` * Regenerate: node scripts/fetch-yerevan-streets.mjs`,
    ` */`,
    ``,
    `export const streetsByDistrict: Record<string, string[]> = {`,
    ...Object.entries(result).flatMap(([key, streets]) => [
      `  ${key}: [`,
      ...streets.map(s => `    ${JSON.stringify(s)},`),
      `  ],`,
      ``,
    ]),
    `};`,
    ``,
    `export const allKnownStreets: Set<string> = new Set(`,
    `  Object.values(streetsByDistrict).flat()`,
    `);`,
    ``,
    `export function isStreetInDistrict(district: string, street: string): boolean {`,
    `  if (!street || !street.trim()) return true;`,
    `  const list = streetsByDistrict[district];`,
    `  if (!list || list.length === 0) return true;`,
    `  const norm = (s: string) => s.trim().toLowerCase();`,
    `  return list.some((s) => norm(s) === norm(street));`,
    `}`,
  ].join("\n");

  writeFileSync(OUT, ts, "utf8");
  console.log(`\n✓ Written to src/lib/yerevan-streets.ts`);

  if (total === 0) {
    console.log(`\n⚠ 0 streets written. The OSM district relations may use different names.`);
    console.log(`  Check the list printed above and update the DISTRICTS name arrays in this script.`);
  } else {
    console.log(`\nNext steps:`);
    console.log(`  git add src/lib/yerevan-streets.ts`);
    console.log(`  git commit -m "chore: streets from OSM"`);
    console.log(`  git push`);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
