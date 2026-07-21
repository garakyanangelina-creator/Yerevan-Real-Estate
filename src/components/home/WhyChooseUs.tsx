import { useTranslations } from "next-intl";
import { ShieldCheck, MapPinned, Lock, Headset } from "lucide-react";

export default function WhyChooseUs() {
  const t = useTranslations("home");

  const items = [
    { icon: ShieldCheck, title: t("why1Title"), text: t("why1Text"), color: "text-gold-500" },
    { icon: MapPinned,   title: t("why2Title"), text: t("why2Text"), color: "text-gold-500" },
    { icon: Lock,        title: t("why3Title"), text: t("why3Text"), color: "text-gold-500" },
    { icon: Headset,     title: t("why4Title"), text: t("why4Text"), color: "text-gold-500" },
  ];

  return (
    <section className="bg-gradient-to-b from-primary-50 to-white py-20 dark:from-primary-800/30 dark:to-primary-900">
      <div className="container-page">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white sm:text-4xl">
            {t("whyTitle")}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gold-400" />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="card group p-7 text-center transition duration-300 hover:-translate-y-1 hover:shadow-premium"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 transition duration-300 group-hover:bg-gold-50 dark:bg-primary-700/50 dark:group-hover:bg-gold-900/20">
                <item.icon className={`h-7 w-7 ${item.color}`} />
              </div>
              <h3 className="mt-5 font-semibold text-primary-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-500 dark:text-white/60">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
