/**
 * Strict district → streets mapping for Yerevan.
 * Each street appears in EXACTLY ONE district — the district where it
 * primarily / geographically belongs. Long avenues that cross a border
 * are assigned to the district that contains the majority of the street.
 *
 * This is the single source of truth used by:
 *   - frontend autocomplete (filter by district, then by typed text)
 *   - backend validation (reject district/street mismatches)
 */

export const streetsByDistrict: Record<string, string[]> = {

  /* ─── Kentron (Կentron / Center) ──────────────────────────────────────── */
  kentron: [
    "Abovyan St",
    "Agh Aram St",
    "Amiryan St",
    "Aram St",
    "Arami St",
    "Arshakunyats Ave",
    "Azatutyan Ave",
    "Baghramyan Ave",
    "Buzand St",
    "Charents St",
    "Dro St",
    "France Square",
    "Gevorgyan St",
    "Grigor Lusavorich St",
    "Hanrapetutyan St",
    "Isahakyan St",
    "Khanjyan St",
    "Koryun St",
    "Mashtots Ave",
    "Martiros Saryan St",
    "Moscovyan St",
    "Nalbandyan St",
    "Nzhdeh St",
    "Parpetsi St",
    "Paronyan St",
    "Pushkin St",
    "Republic Square",
    "Sayat-Nova Ave",
    "Spandarian St",
    "Terian St",
    "Tigran Mets Ave",
    "Tigranyan St",
    "Tumanyan St",
    "Vardanants St",
    "Vazgen Sargsyan St",
  ],

  /* ─── Arabkir (Արabkir) ───────────────────────────────────────────────── */
  arabkir: [
    "Andranik St",
    "Antarayin St",
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
  ],

  /* ─── Davtashen (Dawttashen) ──────────────────────────────────────────── */
  davtashen: [
    "Davtashen 1st District",
    "Davtashen 2nd District",
    "Davtashen 3rd District",
    "Davtashen 4th District",
    "Gegham St",
    "Gyumrian Highway",
    "Hovhannes Shiraz St",
    "Movses Khorenatsi St",
    "Tsitsernakaberd Highway",
    "Vahan Teryan St",
  ],

  /* ─── Ajapnyak (Ajafarnyak) ───────────────────────────────────────────── */
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
    "Khachatur Abovyan St",
    "Leningradsyan St",
    "Vardavar St",
  ],

  /* ─── Shengavit (Shengavit) ───────────────────────────────────────────── */
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

  /* ─── Kanaker-Zeytun (Kanaker-Zeytun) ────────────────────────────────── */
  kanakerZeytun: [
    "Avan-Arinj Highway",
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

  /* ─── Nor Nork (Norr Nork) ────────────────────────────────────────────── */
  norNork: [
    "Halabyan St",
    "Nor Nork 1st District",
    "Nor Nork 2nd District",
    "Nor Nork 3rd District",
    "Nor Nork 4th District",
    "Nor Nork 5th District",
    "Norki St",
    "Teryan St",
  ],

  /* ─── Malatia-Sebastia (Malatia-Sebastia) ────────────────────────────── */
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

  /* ─── Avan (Avan) ─────────────────────────────────────────────────────── */
  avan: [
    "Abovyan Highway",
    "Avan 1st District",
    "Avan 2nd District",
    "Avan 3rd District",
    "Avan Ave",
    "Geghadir St",
    "Haghpat St",
    "Nor Arinj St",
    "Tsaghkadzori Highway",
  ],

  /* ─── Erebuni (Erebuni) ───────────────────────────────────────────────── */
  erebuni: [
    "Erebuni 1st District",
    "Erebuni 2nd District",
    "Erebuni 3rd District",
    "Erebuni St",
    "Nairi Zarian St",
    "Sepuh St",
    "Zvartnots Airport Area",
  ],

  /* ─── Nork-Marash (Nork-Marash) ──────────────────────────────────────── */
  norkMarash: [
    "Marash St",
    "Nork 1st District",
    "Nork 2nd District",
    "Nork 3rd District",
    "Nork Massiv",
    "Nork-Marash Ave",
    "Yeritsyan St",
  ],

  /* ─── Nubarashen (Nubarashen) ─────────────────────────────────────────── */
  nubarashen: [
    "Nubarashen 1st District",
    "Nubarashen 2nd District",
    "Nubarashen 3rd District",
    "Nubarashen 4th District",
    "Nubarashen Ave",
  ],

  other: [],
};

/** Flat set of all known streets — used by backend validation */
export const allKnownStreets: Set<string> = new Set(
  Object.values(streetsByDistrict).flat()
);

/**
 * Returns true if the given street actually belongs to the given district.
 * An empty street value always passes (field is optional).
 */
export function isStreetInDistrict(district: string, street: string): boolean {
  if (!street) return true;
  const list = streetsByDistrict[district];
  if (!list) return true; // unknown district — don't block submission
  return list.some((s) => s.toLowerCase() === street.toLowerCase());
}
