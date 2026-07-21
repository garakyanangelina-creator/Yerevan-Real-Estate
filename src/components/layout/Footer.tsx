import { useTranslations } from "next-intl";
import { Instagram, Send, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "@/i18n/routing";

const PHONES = [
  { display: "+374 77 757 762", tel: "+37477757762" },
  { display: "+374 44 222 310", tel: "+37444222310" },
  { display: "+374 93 524 419", tel: "+37493524419" },
];

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t border-primary-100 bg-primary-900 text-white dark:border-white/10">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand + socials */}
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Yerevan Real Estate logo" width={48} height={48} className="rounded-xl" />
            <h3 className="font-serif text-lg font-semibold leading-tight">
              Yerevan<br />Real Estate
            </h3>
          </div>
          <p className="mt-4 text-sm text-white/70">{t("tagline")}</p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://www.instagram.com/yerevanrealestate_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center justify-center rounded-full bg-white/10 p-2.5 transition hover:bg-gold-500/80"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://t.me/yerevanrealestate"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="flex items-center justify-center rounded-full bg-white/10 p-2.5 transition hover:bg-gold-500/80"
            >
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold-400">{t("quickLinks")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link href="/search" className="transition hover:text-white">{nav("search")}</Link></li>
            <li><Link href="/submit" className="transition hover:text-white">{nav("submit")}</Link></li>
            <li><Link href="/contact" className="transition hover:text-white">{nav("contact")}</Link></li>
            <li><Link href="/admin" className="transition hover:text-white">{nav("admin")}</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold-400">{t("contactInfo")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {PHONES.map((p) => (
              <li key={p.tel}>
                <a
                  href={`tel:${p.tel}`}
                  className="flex items-center gap-2 transition hover:text-gold-400"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                  {p.display}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2 pt-1">
              <Mail className="h-4 w-4 shrink-0 text-gold-500" />
              <a href="mailto:info@yerevanrealestate.am" className="transition hover:text-gold-400">
                info@yerevanrealestate.am
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              Yerevan, Armenia
            </li>
          </ul>
        </div>

        {/* Follow us / WhatsApp */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold-400">{t("followUs")}</h4>
          <p className="mt-4 text-sm text-white/70">
            {t("tagline")}
          </p>
          <a
            href="https://wa.me/37477757762"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-gold-400 hover:text-gold-400"
          >
            WhatsApp: +374 77 757 762
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Yerevan Real Estate. {t("rights")}
      </div>
    </footer>
  );
}
