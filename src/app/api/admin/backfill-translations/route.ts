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
    // Skip only if all three locales are populated (truly complete)
    if (!force && listing.titleEn && listing.titleRu && listing.titleHy) {
      skipped++;
      continue;
    }

    try {
      const sourceLang = detectLocale(listing.title);
      const [titleT, descT] = await Promise.all([
        translateToAllLocales(listing.title, sourceLang),
        listing.description ? translateToAllLocales(listing.description, sourceLang) : Promise.resolve(null),
      ]);

      // Build update data — only include fields that were actually translated (non-null)
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
      translated++;
      await new Promise((r) => setTimeout(r, 300));
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
  const force = new URL(request.url).searchParams.get("force") === "true";
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
