import { useTranslations } from "next-intl";
import { Facebook, Instagram, Send, Phone, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t border-primary-100 bg-primary-900 text-white dark:border-white/10">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-serif text-xl font-semibold">Yerevan Real Estate</h3>
          <p className="mt-3 text-sm text-white/70">{t("tagline")}</p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Facebook" className="rounded-full bg-white/10 p-2 hover:bg-gold-500/80">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-full bg-white/10 p-2 hover:bg-gold-500/80">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Telegram" className="rounded-full bg-white/10 p-2 hover:bg-gold-500/80">
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gold-400">{t("quickLinks")}</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/search">{nav("search")}</Link></li>
            <li><Link href="/submit">{nav("submit")}</Link></li>
            <li><Link href="/contact">{nav("contact")}</Link></li>
            <li><Link href="/admin">{nav("admin")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gold-400">{t("contactInfo")}</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +374 10 000 000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@yerevanrealestate.am</li>
            <li>Yerevan, Armenia</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gold-400">{t("followUs")}</h4>
          <p className="mt-4 text-sm text-white/70">
            WhatsApp: <a href="https://wa.me/37400000000" className="underline">+374 00 000000</a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Yerevan Real Estate. {t("rights")}
      </div>
    </footer>
  );
}
