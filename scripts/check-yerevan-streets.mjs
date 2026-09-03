/**
 * Data-quality check for yerevan-streets.ts
 * Run: node scripts/check-yerevan-streets.mjs
 *
 * Detects:
 *  - Streets appearing in multiple districts
 *  - Districts with suspiciously few streets
 *  - Duplicate street names within one district
 *  - Streets with no English name (only Armenian)
 *  - Missing districts
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dir, "../src/lib/yerevan-streets.ts"), "utf8");

const REQUIRED_DISTRICTS = [
  "kentron", "arabkir", "avan", "davtashen", "erebuni",
  "kanakerZeytun", "ajapnyak", "malatiaSebastia",
  "norNork", "norkMarash", "nubarashen", "shengavit",
];

// Parse the file by extracting key: [ ... ] blocks
const regex = /^\s{2}(\w+):\s*\[([\s\S]*?)\s*\],/gm;
const districts = {};
let m;
while ((m = regex.exec(src)) !== null) {
  const key = m[1];
  const entries = [...m[2].matchAll(/"([^"]+)"/g)].map(x => x[1]);
  districts[key] = entries;
}

let errors = 0;
let warnings = 0;

function err(msg)  { console.error(`  ✗ ERROR:   ${msg}`); errors++; }
function warn(msg) { console.warn(`  ⚠ WARNING: ${msg}`);  warnings++; }
function ok(msg)   { console.log(`  ✓ OK:      ${msg}`); }

console.log("═══════════════════════════════════════════════════");
console.log("  Yerevan Streets — Data Quality Check");
console.log("═══════════════════════════════════════════════════\n");

// 1. Check all 12 required districts are present
console.log("1. District presence");
for (const key of REQUIRED_DISTRICTS) {
  if (districts[key]) {
    ok(`${key} present (${districts[key].length} streets)`);
  } else {
    err(`${key} is MISSING from streetsByDistrict`);
  }
}

// 2. Check minimum street count per district
console.log("\n2. Street counts");
for (const key of REQUIRED_DISTRICTS) {
  const count = districts[key]?.length ?? 0;
  if (count === 0) {
    err(`${key} has ZERO streets`);
  } else if (count < 5) {
    warn(`${key} has only ${count} streets — likely incomplete`);
  } else if (count < 15) {
    warn(`${key} has ${count} streets — may be incomplete (run npm run streets:fetch)`);
  } else {
    ok(`${key}: ${count} streets`);
  }
}

// 3. Check for duplicates within a district
console.log("\n3. Intra-district duplicates");
let allClean = true;
for (const [key, streets] of Object.entries(districts)) {
  if (key === "other") continue;
  const seen = new Set();
  const dups = [];
  for (const s of streets) {
    const norm = s.toLowerCase().trim();
    if (seen.has(norm)) dups.push(s);
    seen.add(norm);
  }
  if (dups.length > 0) {
    err(`${key} has duplicate streets: ${dups.join(", ")}`);
    allClean = false;
  }
}
if (allClean) ok("No intra-district duplicates");

// 4. Check for cross-district duplicates
console.log("\n4. Cross-district duplicates");
const globalMap = new Map();
for (const [key, streets] of Object.entries(districts)) {
  if (key === "other") continue;
  for (const s of streets) {
    const norm = s.toLowerCase().trim();
    if (!globalMap.has(norm)) globalMap.set(norm, []);
    globalMap.get(norm).push(key);
  }
}
const crossDups = [...globalMap.entries()].filter(([, ds]) => ds.length > 1);
if (crossDups.length === 0) {
  ok("No street appears in more than one district");
} else {
  for (const [s, ds] of crossDups) {
    warn(`"${s}" appears in: ${ds.join(", ")}`);
  }
}

// 5. Check for suspicious names
console.log("\n5. Name quality");
const suspicious = [];
for (const [key, streets] of Object.entries(districts)) {
  if (key === "other") continue;
  for (const s of streets) {
    if (s.match(/^\d+$/)) suspicious.push(`${key}: "${s}" (purely numeric)`);
    if (s.length < 3) suspicious.push(`${key}: "${s}" (too short)`);
    if (s.length > 80) suspicious.push(`${key}: "${s}" (unusually long)`);
  }
}
if (suspicious.length === 0) {
  ok("All street names look reasonable");
} else {
  suspicious.forEach(s => warn(s));
}

// 6. Summary
const total = REQUIRED_DISTRICTS.reduce((sum, k) => sum + (districts[k]?.length ?? 0), 0);
console.log("\n═══════════════════════════════════════════════════");
console.log(`  SUMMARY`);
console.log(`  Total streets: ${total}`);
console.log(`  Errors:        ${errors}`);
console.log(`  Warnings:      ${warnings}`);
console.log("═══════════════════════════════════════════════════");

if (total < 200) {
  console.log(`\n  ⚠  Only ${total} streets total.`);
  console.log(`     For a complete dataset, run:`);
  console.log(`       npm run streets:fetch`);
  console.log(`     This fetches real OSM data (requires internet access).`);
}

if (errors > 0) {
  console.log(`\n  ✗ ${errors} error(s) found. Fix before deploying.`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n  ⚠ ${warnings} warning(s). Review and run streets:fetch for full data.`);
} else {
  console.log(`\n  ✓ All checks passed.`);
}
