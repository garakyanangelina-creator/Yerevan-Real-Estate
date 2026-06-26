import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { districts } from "@/lib/mock-data";

const districtImages: Record<string, string> = {
  kentron: "photo-1570129477492-45c003edd2be",
  arabkir: "photo-1502672260266-1c1ef2d93688",
  davtashen: "photo-1448630360428-65456885c650",
  ajapnyak: "photo-1494526585095-c41746248156",
  shengavit: "photo-1480074568708-e7b720bb3f09",
  kanakerZeytun: "photo-1496588152823-86ff7695e68f",
  norNork: "photo-1486325212027-8081e485255e",
  malatiaSebastia: "photo-1460317442991-0ec209397118",
  avan: "photo-1449844908441-8829872d2607",
  erebuni: "photo-1480074568708-e7b720bb3f09",
  norkMarash: "photo-1444723121867-7a241cacace9",
  nubarashen: "photo-1500382017468-9049fed747ef",
};

export default function DistrictGrid() {
  const t = useTranslations("home");
  const tDistricts = useTranslations("districts");

  return (
    <section className="container-page py-16">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
          {t("districtsTitle")}
        </h2>
        <p className="mt-2 text-primary-600 dark:text-white/70">{t("districtsSubtitle")}</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {districts.map((d) => (
          <Link
            key={d}
            href={`/search?district=${d}`}
            className="group relative h-32 overflow-hidden rounded-xl2 shadow-soft"
          >
            <img
              src={`https://images.unsplash.com/${districtImages[d]}?auto=format&fit=crop&w=600&q=70`}
              alt={tDistricts(d)}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent" />
            <span className="absolute bottom-3 left-4 font-medium text-white">{tDistricts(d)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
