import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { districts } from "@/lib/mock-data";

const districtImages: Record<string, string> = {
  kentron:         "/district-kentron.jpg",
  arabkir:         "/district-arabkir.jpg",
  davtashen:       "/district-davtashen.jpg",
  ajapnyak:        "/district-ajapnyak.jpg",
  shengavit:       "/district-shengavit.jpg",
  kanakerZeytun:   "/district-kanaker-zeytun.jpg",
  norNork:         "/district-nor-nork.jpg",
  malatiaSebastia: "/district-malatia-sebastia.jpg",
  avan:            "/district-avan.jpg",
  erebuni:         "/district-erebuni.jpg",
  norkMarash:      "/district-nork-marash.jpg",
  nubarashen:      "/district-nubarashen.jpg",
};

export default function DistrictGrid() {
  const t = useTranslations("home");
  const tDistricts = useTranslations("districts");

  return (
    <section className="container-page py-12 sm:py-20">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-primary-900 dark:text-white sm:text-3xl sm:text-4xl">
          {t("districtsTitle")}
        </h2>
        <p className="mt-2 text-sm text-primary-500 dark:text-white/60 sm:mt-3 sm:text-base">
          {t("districtsSubtitle")}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {districts.map((d) => (
          <Link
            key={d}
            href={`/search?district=${d}`}
            className="group relative overflow-hidden rounded-xl shadow-soft ring-1 ring-primary-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-gold-400/30 sm:rounded-2xl"
            style={{ height: "clamp(120px, 25vw, 192px)" }}
          >
            <img
              src={districtImages[d]}
              alt={tDistricts(d)}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/85 via-primary-900/30 to-transparent" />
            <div className="absolute inset-0 bg-gold-500/0 transition duration-300 group-hover:bg-gold-500/10" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4">
              <span className="block text-sm font-semibold text-white drop-shadow sm:text-base">
                {tDistricts(d)}
              </span>
              <span className="mt-0.5 hidden translate-y-2 text-xs text-white/0 transition duration-300 group-hover:translate-y-0 group-hover:text-gold-300 sm:block">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
