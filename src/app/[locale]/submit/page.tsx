import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SubmitForm from "./SubmitForm";

const SITE_URL = "https://www.yerevanreal.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("submit");
  return {
    title: t("title"),
    robots: { index: false },
    alternates: {
      canonical: `${SITE_URL}/${locale}/submit`,
      languages: {
        en: `${SITE_URL}/en/submit`,
        ru: `${SITE_URL}/ru/submit`,
        hy: `${SITE_URL}/hy/submit`,
        "x-default": `${SITE_URL}/en/submit`,
      },
    },
  };
}

export default async function SubmitPage() {
  const t = await getTranslations("submit");

  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">{t("title")}</h1>
      <p className="mt-2 text-primary-600 dark:text-white/70">{t("subtitle")}</p>
      <div className="mt-8">
        <SubmitForm />
      </div>
    </div>
  );
}
