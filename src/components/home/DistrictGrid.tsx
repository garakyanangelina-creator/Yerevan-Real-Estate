import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { districts } from "@/lib/mock-data";

const districtImages: Record<string, string> = {
  kentron:         "photo-1486325212027-8081e485255e",
  arabkir:         "photo-1570129477492-45c003edd2be",
  davtashen:       "photo-1494526585095-c41746248156",
  ajapnyak:        "photo-1460317442991-0ec209397118",
  shengavit:       "photo-1448630360428-65456885c650",
  kanakerZeytun:   "photo-1502672260266-1c1ef2d93688",
  norNork:         "photo-1496588152823-86ff7695e68f",
  malatiaSebastia: "photo-1480074568708-e7b720bb3f09",
  avan:            "photo-1449844908441-8829872d2607",
  erebuni:         "photo-1545324418-cc1a3fa10c00",
  norkMarash:      "photo-1444723121867-7a241cacace9",
  nubarashen:      "photo-1500382017468-9049fed747ef",
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
              src={`https://images.unsplash.com/${districtImages[d]}?auto=format&fit=crop&w=600&q=80`}
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
