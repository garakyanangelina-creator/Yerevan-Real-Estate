import { NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { translateToAllLocales, detectLocale } from "@/lib/translate";

export async function POST(request: Request) {
  await ensureDatabase();
  const session = await getSession();
  if (!session || session.role === "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { force = false } = await request.json().catch(() => ({}));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings = await (prisma.dbProperty as any).findMany({
    select: { id: true, title: true, description: true, titleEn: true, titleRu: true, titleHy: true },
  });

  let translated = 0;
  let skipped = 0;
  let failed = 0;

  for (const listing of listings) {
    // Skip if already translated (unless force=true)
    if (!force && (listing.titleEn || listing.titleRu || listing.titleHy)) {
      skipped++;
      continue;
    }

    try {
      const sourceLang = detectLocale(listing.title);
      const [titleT, descT] = await Promise.all([
        translateToAllLocales(listing.title, sourceLang),
        listing.description ? translateToAllLocales(listing.description, sourceLang) : Promise.resolve(null),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma.dbProperty as any).update({
        where: { id: listing.id },
        data: {
          titleEn: titleT.en,
          titleRu: titleT.ru,
          titleHy: titleT.hy,
          ...(descT ? { descriptionEn: descT.en, descriptionRu: descT.ru, descriptionHy: descT.hy } : {}),
        },
      });
      translated++;
      // Small delay to respect MyMemory rate limit
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ translated, skipped, failed, total: listings.length });
}
