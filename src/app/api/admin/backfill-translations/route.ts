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
    // Skip only if all three locales are populated AND different from the original title
    // (same value = translation failed and stored the source text as fallback)
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
      // Translate titles only — descriptions are long and exhaust the free quota
      const titleT = await translateToAllLocales(listing.title, sourceLang);

      // Build update data — only include fields that were actually translated (non-null)
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

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role === "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = new URL(request.url).searchParams;
  const force = params.get("force") === "true";

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
