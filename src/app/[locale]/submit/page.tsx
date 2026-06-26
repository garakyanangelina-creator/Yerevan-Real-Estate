import { getTranslations } from "next-intl/server";
import SubmitForm from "./SubmitForm";

export async function generateMetadata() {
  const t = await getTranslations("submit");
  return { title: t("title") };
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
