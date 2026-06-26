import { useTranslations } from "next-intl";
import { ShieldCheck, MapPinned, Lock, Headset } from "lucide-react";

export default function WhyChooseUs() {
  const t = useTranslations("home");

  const items = [
    { icon: ShieldCheck, title: t("why1Title"), text: t("why1Text") },
    { icon: MapPinned, title: t("why2Title"), text: t("why2Text") },
    { icon: Lock, title: t("why3Title"), text: t("why3Text") },
    { icon: Headset, title: t("why4Title"), text: t("why4Text") },
  ];

  return (
    <section className="bg-primary-50 py-16 dark:bg-primary-800/30">
      <div className="container-page">
        <h2 className="text-center font-serif text-3xl font-semibold text-primary-900 dark:text-white">
          {t("whyTitle")}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="card p-6 text-center">
              <item.icon className="mx-auto h-8 w-8 text-gold-500" />
              <h3 className="mt-4 font-medium text-primary-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-primary-600 dark:text-white/70">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
