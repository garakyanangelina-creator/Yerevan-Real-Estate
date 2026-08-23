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
    <section className="bg-gradient-to-b from-primary-50 to-white py-12 dark:from-primary-800/30 dark:to-primary-900 sm:py-20">
      <div className="container-page">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold text-primary-900 dark:text-white sm:text-3xl sm:text-4xl">
            {t("whyTitle")}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gold-400" />
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="card group p-5 text-center transition duration-300 hover:-translate-y-1 hover:shadow-premium sm:p-7"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 transition duration-300 group-hover:bg-gold-50 dark:bg-primary-700/50 dark:group-hover:bg-gold-900/20 sm:h-14 sm:w-14">
                <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${item.color}`} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-primary-900 dark:text-white sm:mt-5 sm:text-base">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-primary-500 dark:text-white/60 sm:text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
