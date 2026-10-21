export type TranslatableLocale = "en" | "ru" | "hy";

// MyMemory free API — no key needed, 5 000 chars/day per IP
// Upgrade: set MYMEMORY_EMAIL env var to unlock 10 000 chars/day
const MYMEMORY = "https://api.mymemory.translated.net/get";

// Armenian unicode block: U+0531–U+058A
// Cyrillic block: U+0400–U+04FF
export function detectLocale(text: string): TranslatableLocale {
  if (/[Ա-֊]/.test(text)) return "hy";
  if (/[Ѐ-ӿ]/.test(text)) return "ru";
  return "en";
}

async function callMyMemory(text: string, from: string, to: string): Promise<string> {
  const email = process.env.MYMEMORY_EMAIL;
  const qs = new URLSearchParams({ q: text, langpair: `${from}|${to}` });
  if (email) qs.set("de", email);
  const res = await fetch(`${MYMEMORY}?${qs}`, { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
  const json = await res.json();
  const translated: string = json?.responseData?.translatedText ?? "";
  if (!translated || json?.responseStatus === 429) throw new Error("MyMemory quota or empty");
  return translated;
}

/** Translate `text` into all 3 locales. Returns null for any locale that failed to translate. */
export async function translateToAllLocales(
  text: string,
  sourceLang: TranslatableLocale
): Promise<Record<TranslatableLocale, string | null>> {
  const result: Record<TranslatableLocale, string | null> = { en: null, ru: null, hy: null };
  result[sourceLang] = text; // source language is always set
  if (!text.trim()) return result;

  const targets = (["en", "ru", "hy"] as TranslatableLocale[]).filter((l) => l !== sourceLang);
  await Promise.allSettled(
    targets.map(async (target) => {
      try {
        result[target] = await callMyMemory(text, sourceLang, target);
      } catch {
        // result[target] stays null — display will fall back to original title
      }
    })
  );
  return result;
}
