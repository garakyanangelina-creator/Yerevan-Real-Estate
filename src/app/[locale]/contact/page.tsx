import { getTranslations } from "next-intl/server";
import { Phone, Mail, MapPin } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return { title: t("title") };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div className="container-page py-12">
      <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">{t("title")}</h1>
      <p className="mt-2 text-primary-600 dark:text-white/70">{t("subtitle")}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ContactForm />

        <div>
          <div className="card p-6">
            <h2 className="font-serif text-lg font-semibold text-primary-900 dark:text-white">
              {t("officeTitle")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-700 dark:text-white/70">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold-500" /> {t("address")}</li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                <a href="tel:+37477757762" className="transition hover:text-gold-600">+374 77 757 762</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                <a href="tel:+37444222310" className="transition hover:text-gold-600">+374 44 222 310</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                <a href="tel:+37493524419" className="transition hover:text-gold-600">+374 93 524 419</a>
              </li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-gold-500" /> info@yerevanrealestate.am</li>
            </ul>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl2 shadow-soft">
            <iframe
              title="Office location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=44.50,40.17,44.53,40.19&layer=mapnik"
              className="h-72 w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
