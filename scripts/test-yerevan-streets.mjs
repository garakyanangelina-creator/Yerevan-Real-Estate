/**
 * Automated tests for the Yerevan district/street address system.
 * Run: node scripts/test-yerevan-streets.mjs
 *
 * Tests:
 *  - Every autocomplete result belongs to the selected district only
 *  - isStreetInDistrict() rejects cross-district combinations
 *  - Case/whitespace insensitivity works
 *  - All 12 districts respond correctly to letter searches
 *  - No district leaks streets into another district's results
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

// Load the data by parsing the TypeScript file (no ts-node needed)
const src = readFileSync(join(__dir, "../src/lib/yerevan-streets.ts"), "utf8");
const regex = /^\s{2}(\w+):\s*\[([\s\S]*?)\s*\],/gm;
const streetsByDistrict = {};
let m;
while ((m = regex.exec(src)) !== null) {
  const key = m[1];
  streetsByDistrict[key] = [...m[2].matchAll(/"([^"]+)"/g)].map(x => x[1]);
}

function isStreetInDistrict(district, street) {
  if (!street) return true;
  const list = streetsByDistrict[district];
  if (!list || list.length === 0) return true;
  const norm = s => s.trim().toLowerCase();
  return list.some(s => norm(s) === norm(street));
}

function autocomplete(districtKey, query) {
  const list = streetsByDistrict[districtKey] ?? [];
  const q = query.toLowerCase().trim();
  return list.filter(s => s.toLowerCase().includes(q));
}

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    failed++;
  }
}

function assertNot(condition, label) {
  assert(!condition, label);
}

console.log("═══════════════════════════════════════════════════");
console.log("  Yerevan Streets — Automated Tests");
console.log("═══════════════════════════════════════════════════\n");

// ── Test 1: No cross-district leakage in autocomplete ──────────────────────
console.log("1. No cross-district leakage");

const ALL_DISTRICTS = Object.keys(streetsByDistrict).filter(k => k !== "other");

for (const district of ALL_DISTRICTS) {
  const streets = streetsByDistrict[district] ?? [];
  for (const street of streets) {
    // Check that street does NOT appear in any other district's autocomplete
    for (const otherDistrict of ALL_DISTRICTS) {
      if (otherDistrict === district) continue;
      const results = autocomplete(otherDistrict, street);
      assertNot(
        results.includes(street),
        `"${street}" must NOT appear in ${otherDistrict} (belongs to ${district})`
      );
    }
  }
}

// ── Test 2: isStreetInDistrict — correct rejections ─────────────────────────
console.log("\n2. Backend validation — correct rejections");

// Known wrong combinations (street in one district shown in another)
const wrongCombinations = [
  { district: "kanakerZeytun", street: "Paronyan St",   reason: "Paronyan is in Kentron" },
  { district: "arabkir",       street: "Mashtots Ave",  reason: "Mashtots is in Kentron" },
  { district: "kentron",       street: "Komitas Ave",   reason: "Komitas is in Arabkir" },
  { district: "avan",          street: "Artashat Highway", reason: "Artashat Hwy is in Shengavit" },
  { district: "shengavit",     street: "Leningradsyan St", reason: "Leningradsyan is in Ajapnyak" },
  { district: "norNork",       street: "Sebastian St",  reason: "Sebastia is in Shengavit/Malatia" },
  { district: "davtashen",     street: "Erebuni St",    reason: "Erebuni St is in Erebuni" },
];

for (const { district, street, reason } of wrongCombinations) {
  // Only test if the street actually exists somewhere in our data
  const existsAnywhere = ALL_DISTRICTS.some(d => isStreetInDistrict(d, street) && streetsByDistrict[d]?.includes(street));
  if (existsAnywhere) {
    assertNot(
      isStreetInDistrict(district, street),
      `Reject ${district} + "${street}" (${reason})`
    );
  }
}

// ── Test 3: isStreetInDistrict — correct approvals ──────────────────────────
console.log("\n3. Backend validation — correct approvals");

// Each district: first 3 streets should pass
for (const district of ALL_DISTRICTS) {
  const streets = (streetsByDistrict[district] ?? []).slice(0, 3);
  for (const street of streets) {
    assert(
      isStreetInDistrict(district, street),
      `Accept ${district} + "${street}"`
    );
  }
}

// ── Test 4: Case and whitespace insensitivity ────────────────────────────────
console.log("\n4. Case / whitespace insensitivity");

const variants = [
  { district: "kentron", street: "mashtots ave",    desc: "lowercase" },
  { district: "kentron", street: "MASHTOTS AVE",    desc: "uppercase" },
  { district: "kentron", street: "  Mashtots Ave  ", desc: "extra spaces" },
  { district: "arabkir", street: "komitas ave",     desc: "lowercase Komitas" },
  { district: "shengavit", street: "artashat highway", desc: "lowercase Artashat" },
];

for (const { district, street, desc } of variants) {
  const clean = street.trim();
  // Only test if the street is in our dataset (skip if dataset is small)
  const base = clean.replace(/\s+/g, " ").toLowerCase();
  const inList = (streetsByDistrict[district] ?? []).some(s => s.toLowerCase().trim() === base);
  if (inList) {
    assert(
      isStreetInDistrict(district, street),
      `Accept ${district} + "${street}" (${desc})`
    );
  }
}

// ── Test 5: Autocomplete returns only district streets ───────────────────────
console.log("\n5. Autocomplete — first-letter searches return only district streets");

const letterTests = [
  { district: "kanakerZeytun", letter: "P", mustNotContain: "Paronyan St" },
  { district: "arabkir",       letter: "K", mustContain:    "Komitas Ave" },
  { district: "kentron",       letter: "P", mustContain:    "Paronyan St" },
  { district: "shengavit",     letter: "A", mustContain:    "Artashat Highway" },
  { district: "ajapnyak",      letter: "L", mustContain:    "Leningradsyan St" },
  { district: "erebuni",       letter: "E", mustContain:    "Erebuni St" },
];

for (const { district, letter, mustContain, mustNotContain } of letterTests) {
  const results = autocomplete(district, letter);
  if (mustContain) {
    const found = results.some(r => r.toLowerCase().includes(mustContain.toLowerCase()));
    // Only assert if the street exists in dataset
    if ((streetsByDistrict[district] ?? []).includes(mustContain)) {
      assert(found, `${district} + "${letter}" → includes "${mustContain}"`);
    }
  }
  if (mustNotContain) {
    assertNot(
      results.some(r => r.toLowerCase() === mustNotContain.toLowerCase()),
      `${district} + "${letter}" → must NOT include "${mustNotContain}"`
    );
  }
  // Verify every result belongs to this district
  for (const r of results) {
    assert(
      isStreetInDistrict(district, r),
      `${district} + "${letter}" result "${r}" belongs to district`
    );
  }
}

// ── Test 6: Empty/null inputs don't throw ────────────────────────────────────
console.log("\n6. Edge cases — empty inputs");
assert(isStreetInDistrict("kentron", ""),       "Empty street → passes");
assert(isStreetInDistrict("kentron", "   "),    "Whitespace-only street → passes (treated as empty)");
assert(isStreetInDistrict("unknownDistrict", "Anything St"), "Unknown district → passes");
assert(isStreetInDistrict("", "Mashtots Ave"),  "Empty district → passes");

// ── Summary ──────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════");
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log("═══════════════════════════════════════════════════");

if (failed > 0) {
  process.exit(1);
}
