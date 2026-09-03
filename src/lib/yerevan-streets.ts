/**
 * Yerevan district → streets mapping.
 *
 * This file has TWO modes:
 *
 * 1. GENERATED (preferred) — run the fetch script to get real OSM data:
 *      node scripts/fetch-yerevan-streets.mjs
 *    The script queries OpenStreetMap and writes this file automatically.
 *    That gives hundreds of real streets per district.
 *
 * 2. STATIC FALLBACK (current) — manually curated best-effort data.
 *    Use only until you run the fetch script.
 *    Every street appears in exactly ONE district.
 *
 * RULES enforced by isStreetInDistrict():
 *   - Autocomplete shows only streets of the selected district
 *   - Backend API rejects any district+street combination not in this map
 */

export const streetsByDistrict: Record<string, string[]> = {

  // ── Kentron ───────────────────────────────────────────────────────────────
  // The historic city centre. Dense grid of named streets.
  kentron: [
    "Abovyan St",
    "Agatangeghos St",
    "Agh Aram St",
    "Amiryan St",
    "Aram St",
    "Arami St",
    "Arshakunyats Ave",
    "Azatutyan Ave",
    "Baghramyan Ave",
    "Buzand St",
    "Charents St",
    "Demirchyan St",
    "Dro St",
    "France Square",
    "Gevorgyan St",
    "Grigor Lusavorich St",
    "Hayk Bek St",
    "Hanrapetutyan St",
    "Isahakyan St",
    "Khanjyan St",
    "Koryun St",
    "Mashtots Ave",
    "Martiros Saryan St",
    "Mkrtich Khrimyan St",
    "Moscovyan St",
    "Movses Khorenatsi St",
    "Nalbandyan St",
    "Nzhdeh St",
    "Parpetsi St",
    "Paronyan St",
    "Pushkin St",
    "Republic Square",
    "Sayat-Nova Ave",
    "Spandarian St",
    "Sundukyan St",
    "Terian St",
    "Tigran Mets Ave",
    "Tigranyan St",
    "Torosyan St",
    "Tumanyan St",
    "Vagharshyan St",
    "Vardanants St",
    "Vazgen Sargsyan St",
    "Yeznik Koghbatsi St",
  ],

  // ── Arabkir ───────────────────────────────────────────────────────────────
  arabkir: [
    "Andranik St",
    "Ashtarak Highway",
    "Byuzandakan St",
    "Davit Anhaght St",
    "Dzoraghbyur St",
    "Hakob Hakobyan St",
    "Kaghakatsin St",
    "Kievyan St",
    "Komitas Ave",
    "Manandyan St",
    "Margaryan St",
    "Mher Mkrtchyan St",
    "Muratsan St",
    "Norageryan St",
    "Paruyr Sevak St",
    "Tbilisi Highway",
    "Tigranyan Arabkir St",
    "Vardanants Arabkir St",
  ],

  // ── Davtashen ─────────────────────────────────────────────────────────────
  davtashen: [
    "Davtashen 1st District",
    "Davtashen 2nd District",
    "Davtashen 3rd District",
    "Davtashen 4th District",
    "Gegham St",
    "Gyumrian Highway",
    "Hovhannes Shiraz St",
    "Movses Khorenatsi Davtashen St",
    "Tsitsernakaberd Highway",
    "Vahan Teryan St",
  ],

  // ── Ajapnyak ──────────────────────────────────────────────────────────────
  ajapnyak: [
    "Ajapnyak 1st District",
    "Ajapnyak 2nd District",
    "Ajapnyak 3rd District",
    "Alek Manukyan St",
    "Argishti St",
    "Artsvik St",
    "Ashotavan St",
    "Garegin Nzhdeh St",
    "Hrachya Kochar St",
    "Khachatur Abovyan Ajapnyak St",
    "Leningradsyan St",
    "Sardanapali St",
    "Tigranakert St",
    "Vardavar St",
    "Yervan Kochar St",
  ],

  // ── Shengavit ─────────────────────────────────────────────────────────────
  shengavit: [
    "Artashat Highway",
    "David Bek St",
    "Garegin Nzhdeh Square",
    "Kamo St",
    "Karmir Blur St",
    "Raffi St",
    "Rubinyants St",
    "Sebastia St",
    "Shengavit 1st District",
    "Shengavit 2nd District",
    "Shengavit 3rd District",
    "Shengavit 4th District",
    "Tigranashen St",
    "Vardges Sureniants St",
    "Yerznkyan St",
  ],

  // ── Kanaker-Zeytun ────────────────────────────────────────────────────────
  kanakerZeytun: [
    "Avan-Arinj Highway",
    "Azatutyan Zeytun St",
    "Charentsavan St",
    "Gyulbenkyan St",
    "Kanaker 1st District",
    "Kanaker 2nd District",
    "Kanaker-Zeytun Ave",
    "Lernagorts St",
    "Yervand Kochar St",
    "Zeytun 1st District",
    "Zeytun 2nd District",
    "Zeytun 3rd District",
  ],

  // ── Nor Nork ──────────────────────────────────────────────────────────────
  norNork: [
    "Halabyan St",
    "Nor Nork 1st District",
    "Nor Nork 2nd District",
    "Nor Nork 3rd District",
    "Nor Nork 4th District",
    "Nor Nork 5th District",
    "Norki St",
    "Teryan Nor Nork St",
    "Yervandashati St",
  ],

  // ── Malatia-Sebastia ──────────────────────────────────────────────────────
  malatiaSebastia: [
    "Ararat St",
    "Armenakyan St",
    "Malatia 1st District",
    "Malatia 2nd District",
    "Malatia 3rd District",
    "Malatia 4th District",
    "Mushakan St",
    "Zvartnots Highway",
  ],

  // ── Avan ──────────────────────────────────────────────────────────────────
  avan: [
    "Abovyan Highway",
    "Avan 1st District",
    "Avan 2nd District",
    "Avan 3rd District",
    "Avan Ave",
    "Avan-Arinj Ave",
    "Geghadir St",
    "Haghpat St",
    "Nor Arinj St",
    "Sevan St",
    "Tsaghkadzori Highway",
  ],

  // ── Erebuni ───────────────────────────────────────────────────────────────
  erebuni: [
    "Erebuni 1st District",
    "Erebuni 2nd District",
    "Erebuni 3rd District",
    "Erebuni St",
    "Nairi Zarian St",
    "Sepuh St",
    "Tigranashen Erebuni St",
    "Zvartnots Airport Area",
  ],

  // ── Nork-Marash ───────────────────────────────────────────────────────────
  norkMarash: [
    "Marash St",
    "Nork 1st District",
    "Nork 2nd District",
    "Nork 3rd District",
    "Nork Massiv",
    "Nork-Marash Ave",
    "Yeritsyan St",
  ],

  // ── Nubarashen ────────────────────────────────────────────────────────────
  nubarashen: [
    "Nubarashen 1st District",
    "Nubarashen 2nd District",
    "Nubarashen 3rd District",
    "Nubarashen 4th District",
    "Nubarashen Ave",
  ],

  other: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flat set of every known street. Used by backend validation. */
export const allKnownStreets: Set<string> = new Set(
  Object.values(streetsByDistrict).flat()
);

/**
 * Returns true when the given street belongs to the given district.
 * - Empty/missing street always passes (the field is optional).
 * - Unknown district always passes (don't block submissions for new districts).
 * - Comparison is case-insensitive and trims whitespace.
 */
export function isStreetInDistrict(district: string, street: string): boolean {
  if (!street || !street.trim()) return true;
  const list = streetsByDistrict[district];
  if (!list || list.length === 0) return true;
  const norm = (s: string) => s.trim().toLowerCase();
  return list.some((s) => norm(s) === norm(street));
}
