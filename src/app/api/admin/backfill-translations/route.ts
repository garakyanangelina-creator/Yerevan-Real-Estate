import { NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { translateToAllLocales, detectLocale } from "@/lib/translate";

async function runBackfill(force: boolean) {
  await ensureDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings = await (prisma.dbProperty as any).findMany({
    select: { id: true, title: true, description: true, titleEn: true, titleRu: true, titleHy: true },
  });

  let translated = 0;
  let skipped = 0;
  let failed = 0;

  for (const listing of listings) {
    const allPopulated = listing.titleEn && listing.titleRu && listing.titleHy;
    const anyBad =
      listing.titleEn === listing.title ||
      listing.titleRu === listing.title ||
      listing.titleHy === listing.title;
    if (!force && allPopulated && !anyBad) {
      skipped++;
      continue;
    }

    try {
      const sourceLang = detectLocale(listing.title);
      const titleT = await translateToAllLocales(listing.title, sourceLang);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: Record<string, any> = {};
      if (titleT.en !== null) data.titleEn = titleT.en;
      if (titleT.ru !== null) data.titleRu = titleT.ru;
      if (titleT.hy !== null) data.titleHy = titleT.hy;

      if (Object.keys(data).length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.dbProperty as any).update({ where: { id: listing.id }, data });
      }
      translated++;
      await new Promise((r) => setTimeout(r, 1200));
    } catch {
      failed++;
    }
  }

  return { translated, skipped, failed, total: listings.length };
}

// Translate descriptions in small batches to stay within daily API quota
async function runDescBackfill(limit: number) {
  await ensureDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings = await (prisma.dbProperty as any).findMany({
    select: { id: true, title: true, description: true, descriptionEn: true, descriptionRu: true, descriptionHy: true },
  });

  // Only process listings that have a description but are missing translated descriptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todo = listings.filter((l: any) =>
    l.description && (!l.descriptionRu || l.descriptionRu === l.description)
  ).slice(0, limit);

  let translated = 0;
  let skipped = listings.length - todo.length;
  let failed = 0;

  for (const listing of todo) {
    try {
      const sourceLang = detectLocale(listing.title);
      const desc = listing.description.slice(0, 800); // cap to save quota
      const descT = await translateToAllLocales(desc, sourceLang);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: Record<string, any> = {};
      if (descT.en !== null) data.descriptionEn = descT.en;
      if (descT.ru !== null) data.descriptionRu = descT.ru;
      if (descT.hy !== null) data.descriptionHy = descT.hy;

      if (Object.keys(data).length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.dbProperty as any).update({ where: { id: listing.id }, data });
      }
      translated++;
      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      failed++;
    }
  }

  const remaining = todo.length - translated - failed;
  return { translated, skipped, failed, total: listings.length, remaining: Math.max(0, listings.length - skipped - translated) };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role === "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = new URL(request.url).searchParams;
  const force = params.get("force") === "true";

  // ?desc=true — translate descriptions in small batches (default 5 per call)
  if (params.get("desc") === "true") {
    const limit = Math.min(20, parseInt(params.get("limit") ?? "5", 10) || 5);
    const result = await runDescBackfill(limit);
    return NextResponse.json(result);
  }

  // ?clearBadDesc=true — null out description translations that equal the original (bad data)
  if (params.get("clearBadDesc") === "true") {
    await ensureDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma.dbProperty as any).findMany({
      select: { id: true, description: true, descriptionEn: true, descriptionRu: true, descriptionHy: true },
    });
    let cleared = 0;
    for (const r of rows) {
      if (!r.description) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: Record<string, any> = {};
      const src = r.description.slice(0, 800);
      if (r.descriptionEn && (r.descriptionEn === r.description || r.descriptionEn === src)) data.descriptionEn = null;
      if (r.descriptionRu && (r.descriptionRu === r.description || r.descriptionRu === src)) data.descriptionRu = null;
      if (r.descriptionHy && (r.descriptionHy === r.description || r.descriptionHy === src)) data.descriptionHy = null;
      if (Object.keys(data).length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.dbProperty as any).update({ where: { id: r.id }, data });
        cleared++;
      }
    }
    return NextResponse.json({ cleared, total: rows.length });
  }

  // ?inspect=0575 — show stored translations for a single listing code
  if (params.get("inspect")) {
    await ensureDatabase();
    const code = parseInt(params.get("inspect") ?? "", 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listing = await (prisma.dbProperty as any).findFirst({
      where: { listingCode: code },
      select: { listingCode: true, title: true, titleEn: true, titleRu: true, titleHy: true, description: true, descriptionEn: true, descriptionRu: true, descriptionHy: true },
    });
    return NextResponse.json(listing ?? { error: "not found" });
  }

  // ?codes=0550,0566 — force-retranslate specific listing codes (title + description)
  if (params.get("codes")) {
    await ensureDatabase();
    const codes = (params.get("codes") ?? "").split(",").map((c) => parseInt(c.trim(), 10)).filter(Boolean);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listings = await (prisma.dbProperty as any).findMany({
      where: { listingCode: { in: codes } },
      select: { id: true, title: true, description: true, listingCode: true },
    });
    const results: Record<string, string> = {};
    for (const listing of listings) {
      try {
        const sourceLang = detectLocale(listing.title);
        const [titleT, descT] = await Promise.all([
          translateToAllLocales(listing.title, sourceLang),
          listing.description ? translateToAllLocales(listing.description.slice(0, 800), sourceLang) : Promise.resolve(null),
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: Record<string, any> = {};
        if (titleT.en !== null) data.titleEn = titleT.en;
        if (titleT.ru !== null) data.titleRu = titleT.ru;
        if (titleT.hy !== null) data.titleHy = titleT.hy;
        if (descT) {
          if (descT.en !== null) data.descriptionEn = descT.en;
          if (descT.ru !== null) data.descriptionRu = descT.ru;
          if (descT.hy !== null) data.descriptionHy = descT.hy;
        }
        if (Object.keys(data).length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (prisma.dbProperty as any).update({ where: { id: listing.id }, data });
        }
        results[listing.listingCode] = "ok";
        await new Promise((r) => setTimeout(r, 1500));
      } catch {
        results[listing.listingCode] = "failed";
      }
    }
    return NextResponse.json({ results });
  }

  // ?check=true — show translation status without translating
  if (params.get("check") === "true") {
    await ensureDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma.dbProperty as any).findMany({
      select: { id: true, title: true, titleEn: true, titleRu: true, titleHy: true },
    });
    const missing = rows
      .filter((r: any) => !r.titleRu || r.titleRu === r.title || !r.titleEn || r.titleEn === r.title)
      .map((r: any) => ({ id: r.id, title: r.title, titleEn: r.titleEn, titleRu: r.titleRu, titleHy: r.titleHy }));
    return NextResponse.json({ total: rows.length, missingCount: missing.length, missing });
  }

  const result = await runBackfill(force);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role === "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { force = false } = await request.json().catch(() => ({}));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings = await (prisma.dbProperty as any).findMany({
    select: { id: true, title: true, description: true, titleEn: true, titleRu: true, titleHy: true },
  });

  const result = await runBackfill(force);
  return NextResponse.json(result);
}
