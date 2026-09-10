import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getPublicProperties } from "@/services/propertyService";
import PropertyCard from "@/components/property/PropertyCard";
import type { Metadata } from "next";

const DISTRICTS: Record<string, { en: string; ru: string; hy: string; description: { en: string; ru: string; hy: string } }> = {
  kentron: {
    en: "Kentron", ru: "Кентрон", hy: "Կենտրոն",
    description: {
      en: "Kentron is the heart of Yerevan — the central district with premium apartments, government buildings, restaurants and cultural landmarks. Ideal for those who want to live in the city center.",
      ru: "Кентрон — сердце Еревана, центральный район с премиальными квартирами, ресторанами и культурными достопримечательностями. Идеально для тех, кто хочет жить в центре города.",
      hy: "Կենտրոնը Երևանի սիրտն է՝ կենտրոնական շրջան պրեմիում բնակարաններով, ռեստորաններով և մշակութային հուշարձաններով:",
    },
  },
  arabkir: {
    en: "Arabkir", ru: "Арабкир", hy: "Արաբկիր",
    description: {
      en: "Arabkir is one of Yerevan's most popular residential districts, known for its wide streets, parks, schools and modern apartment buildings.",
      ru: "Арабкир — один из самых популярных жилых районов Еревана, известный широкими улицами, парками и современными жилыми комплексами.",
      hy: "Արաբկիրը Երևանի ամենաժողովրդական բնակելի թաղամասերից մեկն է՝ հայտնի իր լայն փողոցներով, զբոսայգիներով և ժամանակակից շենքերով:",
    },
  },
  avan: {
    en: "Avan", ru: "Аван", hy: "Ավան",
    description: {
      en: "Avan is a quiet residential district in northeastern Yerevan, offering affordable apartments and houses with easy access to the city center.",
      ru: "Аван — тихий жилой район на северо-востоке Еревана с доступным жильём и удобным транспортным сообщением с центром.",
      hy: "Ավանը Երևանի հյուսիս-արևելքում գտնվող հանգիստ բնակելի թաղամաս է՝ մատչելի բնակարաններով:",
    },
  },
  davtashen: {
    en: "Davtashen", ru: "Давташен", hy: "Դավթաշեն",
    description: {
      en: "Davtashen is a modern district on the western edge of Yerevan with large residential complexes, green areas and good infrastructure.",
      ru: "Давташен — современный район на западной окраине Еревана с крупными жилыми комплексами, зелёными зонами и хорошей инфраструктурой.",
      hy: "Դավթաշենը Երևանի արևմտյան ծայրամասում գտնվող ժամանակակից թաղամաս է՝ մեծ բնակելի համալիրներով:",
    },
  },
  erebuni: {
    en: "Erebuni", ru: "Эребуни", hy: "Էրեբունի",
    description: {
      en: "Erebuni is a southern district of Yerevan, home to the famous Erebuni fortress museum, offering a mix of residential and commercial properties.",
      ru: "Эребуни — южный район Еревана, известный одноимённой крепостью-музеем. Предлагает разнообразное жильё и коммерческую недвижимость.",
      hy: "Էրեբունին Երևանի հարավային թաղամաս է՝ հայտնի Էրեբունի ամրոց-թանգարանով:",
    },
  },
  "malatia-sebastia": {
    en: "Malatia-Sebastia", ru: "Малатия-Себастия", hy: "Մալաթիա-Սեբաստիա",
    description: {
      en: "Malatia-Sebastia is a large residential district in southwestern Yerevan with affordable housing options and good public transport connections.",
      ru: "Малатия-Себастия — крупный жилой район на юго-западе Еревана с доступным жильём и хорошим транспортным сообщением.",
      hy: "Մալաթիա-Սեբաստիան Երևանի հարավ-արևմտյան հատվածի խոշոր բնակելի թաղամաս է:",
    },
  },
  "nor-nork": {
    en: "Nor Nork", ru: "Нор Норк", hy: "Նոր Նորք",
    description: {
      en: "Nor Nork is a large district in eastern Yerevan known for its Soviet-era apartment blocks and ongoing urban renewal, offering some of the city's most affordable properties.",
      ru: "Нор Норк — крупный район на востоке Еревана, известный советскими жилыми кварталами и активной реновацией, с одними из самых доступных цен на жильё.",
      hy: "Նոր Նորքը Երևանի արևելյան հատվածի խոշոր թաղամաս է՝ հայտնի խորհրդային ժամանակաշրջանի շենքերով:",
    },
  },
  "nork-marash": {
    en: "Nork-Marash", ru: "Норк-Мараш", hy: "Նորք-Մարաշ",
    description: {
      en: "Nork-Marash is an elevated district offering panoramic views over Yerevan, known for its private houses and premium villas.",
      ru: "Норк-Мараш — возвышенный район с панорамным видом на Ереван, известный частными домами и премиальными виллами.",
      hy: "Նորք-Մարաշը բարձրադիր թաղամաս է՝ Երևանի վրա համայնապատկերային տեսարաններով:",
    },
  },
  nubarashen: {
    en: "Nubarashen", ru: "Нубарашен", hy: "Նուբարաշեն",
    description: {
      en: "Nubarashen is located in the southern part of Yerevan, offering affordable residential properties close to industrial areas.",
      ru: "Нубарашен расположен в южной части Еревана и предлагает доступное жильё вблизи промышленных зон.",
      hy: "Նուբարաշենը Երևանի հարավային հատվածում է՝ մատչելի բնակելի գույքով:",
    },
  },
  shengavit: {
    en: "Shengavit", ru: "Шенгавит", hy: "Շենգավիթ",
    description: {
      en: "Shengavit is a southern district of Yerevan with a mix of older residential buildings and newer developments, known for its affordability.",
      ru: "Шенгавит — южный район Еревана со смешанной застройкой: старые жилые дома и новые комплексы. Известен доступными ценами на жильё.",
      hy: "Շենգավիթը Երևանի հարավային թաղամաս է՝ հին և նոր շինությունների համադրությամբ:",
    },
  },
  "kanaker-zeytun": {
    en: "Kanaker-Zeytun", ru: "Канакер-Зейтун", hy: "Քանաքեռ-Զեյթուն",
    description: {
      en: "Kanaker-Zeytun is a northern district of Yerevan with a mix of residential properties, offering a quieter lifestyle while remaining connected to the city.",
      ru: "Канакер-Зейтун — северный район Еревана с разнообразным жильём, предлагающий спокойную жизнь в шаговой доступности от города.",
      hy: "Քանաքեռ-Զեյթունը Երևանի հյուսիսային թաղամաս է՝ բնակելի գույքի բազմազանությամբ:",
    },
  },
  ajapnyak: {
    en: "Ajapnyak", ru: "Аджапняк", hy: "Աջափնյակ",
    description: {
      en: "Ajapnyak is a western district of Yerevan with large residential complexes and a growing commercial sector, popular among families.",
      ru: "Аджапняк — западный район Еревана с крупными жилыми комплексами и развивающейся коммерческой инфраструктурой, популярный среди семей.",
      hy: "Աջափնյակը Երևանի արևմտյան թաղամաս է՝ խոշոր բնակելի համալիրներով:",
    },
  },
};

const LOCALE_NAMES: Record<string, keyof typeof DISTRICTS[string]["description"]> = {
  en: "en", ru: "ru", hy: "hy",
};

type Props = { params: { slug: string; locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const district = DISTRICTS[params.slug];
  if (!district) return {};
  const lang = LOCALE_NAMES[params.locale] ?? "en";
  const name = district[lang as "en" | "ru" | "hy"];
  const titles: Record<string, string> = {
    en: `Real Estate in ${name}, Yerevan — Apartments & Properties | Yerevan Real Estate`,
    ru: `Недвижимость в районе ${name}, Ереван — Квартиры и объекты | Yerevan Real Estate`,
    hy: `Անշարժ գույք ${name} թաղամասում, Երևան | Yerevan Real Estate`,
  };
  const descs: Record<string, string> = {
    en: `Browse apartments, houses and commercial properties for sale and rent in ${name}, Yerevan. Find your ideal property with Yerevan Real Estate.`,
    ru: `Квартиры, дома и коммерческая недвижимость на продажу и в аренду в районе ${name}, Ереван. Найдите идеальный объект с Yerevan Real Estate.`,
    hy: `Բնակարաններ, տներ և առևտրային անշարժ գույք ${name} թաղամասում՝ վաճառքի և վարձակալության։`,
  };
  return {
    title: titles[params.locale] ?? titles.en,
    description: descs[params.locale] ?? descs.en,
  };
}

export function generateStaticParams() {
  return Object.keys(DISTRICTS).map((slug) => ({ slug }));
}

export default async function DistrictPage({ params }: Props) {
  const district = DISTRICTS[params.slug];
  if (!district) notFound();

  const lang = LOCALE_NAMES[params.locale] ?? "en";
  const name = district[lang as "en" | "ru" | "hy"];
  const description = district.description[lang as "en" | "ru" | "hy"];

  const { properties } = await getPublicProperties();
  const filtered = properties.filter((p) => p.district === params.slug);

  const headings: Record<string, string> = {
    en: `Real Estate in ${name}, Yerevan`,
    ru: `Недвижимость в районе ${name}, Ереван`,
    hy: `Անշարժ գույք ${name} թաղամասում, Երևան`,
  };
  const subheadings: Record<string, string> = {
    en: `${filtered.length} propert${filtered.length === 1 ? "y" : "ies"} available`,
    ru: `Доступно объектов: ${filtered.length}`,
    hy: `Հասանելի գույք՝ ${filtered.length}`,
  };
  const noResults: Record<string, string> = {
    en: "No properties currently available in this district. Check back soon.",
    ru: "В данном районе пока нет доступных объектов. Загляните позже.",
    hy: "Այս թաղամասում ներկայումս գույք չկա։ Ստուգեք ավելի ուշ։",
  };
  const backLabels: Record<string, string> = {
    en: "← Back to Search",
    ru: "← Назад к поиску",
    hy: "← Վերադառնալ որոնմանը",
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-2">
        <Link href="/search" className="text-sm text-primary-500 hover:text-gold-600 transition dark:text-white/50">
          {backLabels[params.locale] ?? backLabels.en}
        </Link>
      </div>
      <h1 className="font-serif text-2xl font-bold text-primary-900 dark:text-white sm:text-3xl">
        {headings[params.locale] ?? headings.en}
      </h1>
      <p className="mt-2 text-sm text-primary-500 dark:text-white/60">
        {subheadings[params.locale] ?? subheadings.en}
      </p>
      <p className="mt-4 max-w-2xl text-sm text-primary-600 dark:text-white/70 leading-relaxed">
        {description}
      </p>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <p className="text-primary-500 dark:text-white/50">{noResults[params.locale] ?? noResults.en}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
