import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { districts } from "@/lib/mock-data";

const districtImages: Record<string, string> = {
  kentron:         "photo-1486325212027-8081e485255e", // wide city boulevard, premium
  arabkir:         "photo-1570129477492-45c003edd2be", // classic residential street
  davtashen:       "photo-1494526585095-c41746248156", // modern house exterior
  ajapnyak:        "photo-1460317442991-0ec209397118", // apartment buildings
  shengavit:       "photo-1448630360428-65456885c650", // building exterior
  kanakerZeytun:   "photo-1502672260266-1c1ef2d93688", // modern apartment block
  norNork:         "photo-1496588152823-86ff7695e68f", // building with glass facade
  malatiaSebastia: "photo-1480074568708-e7b720bb3f09", // house front
  avan:            "photo-1449844908441-8829872d2607", // residential area
  erebuni:         "photo-1545324418-cc1a3fa10c00", // cityscape
  norkMarash:      "photo-1444723121867-7a241cacace9", // urban / city lights
  nubarashen:      "photo-1500382017468-9049fed747ef", // landscape / outskirts
};

export default function DistrictGrid() {
  const t = useTranslations("home");
  const tDistricts = useTranslations("districts");

  return (
    <section className="container-page py-20">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white sm:text-4xl">
          {t("districtsTitle")}
        </h2>
        <p className="mt-3 text-primary-500 dark:text-white/60">{t("districtsSubtitle")}</p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {districts.map((d) => (
          <Link
            key={d}
            href={`/search?district=${d}`}
            className="group relative h-48 overflow-hidden rounded-2xl shadow-soft ring-1 ring-primary-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-gold-400/30"
          >
            <img
              src={`https://images.unsplash.com/${districtImages[d]}?auto=format&fit=crop&w=600&q=80`}
              alt={tDistricts(d)}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-108"
              loading="lazy"
            />
            {/* Gradient overlay — stronger at bottom for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/85 via-primary-900/30 to-transparent" />

            {/* Hover shimmer */}
            <div className="absolute inset-0 bg-gold-500/0 transition duration-300 group-hover:bg-gold-500/10" />

            {/* District name */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="block font-semibold text-white drop-shadow">{tDistricts(d)}</span>
              <span className="mt-0.5 block translate-y-2 text-xs text-white/0 transition duration-300 group-hover:translate-y-0 group-hover:text-gold-300">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
