import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getPublicProperties } from "@/services/propertyService";
import PropertyCard from "@/components/property/PropertyCard";
import type { Metadata } from "next";

type LocaleString = Partial<Record<"en" | "ru" | "hy", string>>;

type DistrictData = {
  en: string;
  ru: string;
  hy: string;
  description: LocaleString;
  seoTitle?: LocaleString;
  h2About?: LocaleString;
  h2Properties?: LocaleString;
};

const DISTRICTS: Record<string, DistrictData> = {
  kentron: {
    en: "Kentron", ru: "Кентрон", hy: "Կենտրոն",
    description: {
      en: "Kentron is the central district of Yerevan. It contains Republic Square and the Cascade stairway complex. The listings on this page are apartments for rent in Kentron.",
      ru: "Кентрон — центральный район Еревана. В нём расположены площадь Республики и каскадный комплекс. На этой странице — квартиры в аренду в Кентроне.",
      hy: "Կենտրոնը Երևանի սիրտն է՝ կենտրոնական շրջան պրեմիում բնակարաններով, ռեստորաններով և մշակութային հուշարձաններով:",
    },
    seoTitle: {
      en: "Apartments for Rent in Kentron, Yerevan",
      ru: "Квартиры в аренду в Кентроне, Ереван",
    },
    h2About: {
      en: "Kentron sits at the centre of Yerevan. Its main streets include Arshakunyats Avenue, Khanjyan Street and Tamanyan Street. Republic Square and the Cascade complex are both located within the district.",
      ru: "Кентрон расположен в центре Еревана. Главные улицы района — проспект Аршакуняц, улица Ханджяна и улица Таманяна. Площадь Республики и комплекс «Каскад» находятся в пределах района.",
    },
    h2Properties: {
      en: "Browse rental apartments in Kentron. Listed properties include units along Arshakunyats Avenue — including buildings referred to in listing descriptions as the Crystal District complex — and on Khanjyan Street, where one listing mentions the Sun complex by name. Use the filters to search by price, number of bedrooms or floor area.",
      ru: "Квартиры в аренду в Кентроне. Представленные объекты расположены на проспекте Аршакуняц — в том числе в зданиях, упоминаемых в объявлениях как комплекс Crystal District, — и на улице Ханджяна, где одно объявление упоминает комплекс Sun. Используйте фильтры для поиска по цене, количеству спален или площади.",
    },
  },
  arabkir: {
    en: "Arabkir", ru: "Арабкир", hy: "Արաբկիր",
    description: {
      en: "Arabkir is a residential district in the northern part of Yerevan. The listings on this page are apartments for rent in Arabkir.",
      ru: "Арабкир — жилой район в северной части Еревана. На этой странице — квартиры в аренду в Арабкире.",
      hy: "Արաբկիրը Երևանի ամենաժողովրդական բնակելի թաղամասերից մեկն է՝ հայտնի իր լայն փողոցներով, զբոսայգիներով և ժամանակակից շենքերով:",
    },
    seoTitle: {
      en: "Apartments for Rent in Arabkir, Yerevan",
      ru: "Квартиры в аренду в Арабкире, Ереван",
    },
    h2About: {
      en: "Arabkir is located to the north of Yerevan's central district. Komitas Avenue runs through the area and is the district's main artery. The district contains a mix of residential buildings built across different periods.",
      ru: "Арабкир расположен к северу от центрального района Еревана. Проспект Комитас пересекает район и является его главной артерией. Район включает жилые дома разных периодов постройки.",
    },
    h2Properties: {
      en: "Browse rental apartments in Arabkir. Listed properties are located on or close to Komitas Avenue. Use the filters to refine results by price, number of bedrooms or floor area.",
      ru: "Квартиры в аренду в Арабкире. Представленные объекты расположены на проспекте Комитас или рядом с ним. Используйте фильтры для уточнения результатов по цене, количеству спален или площади.",
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
      en: "Davtashen is a residential district on the western side of Yerevan. The listings on this page are apartments for rent in Davtashen.",
      ru: "Давташен — жилой район в западной части Еревана. На этой странице — квартиры в аренду в Давташене.",
      hy: "Դավթաշենը Երևանի արևմտյան ծայրամասում գտնվող ժամանակակից թաղամաս է՝ մեծ բնակելի համալիրներով:",
    },
    seoTitle: {
      en: "Apartments for Rent in Davtashen, Yerevan",
      ru: "Квартиры в аренду в Давташене, Ереван",
    },
    h2About: {
      en: "Davtashen is located on the western side of the city. Its streets include Tigran Petrosyan Street, Anastas Mikoyan Street and Anveher Street. The district consists primarily of residential apartment buildings.",
      ru: "Давташен расположен в западной части города. Улицы района включают улицу Тиграна Петросяна, улицу Анастаса Микояна и улицу Анвехер. Район состоит преимущественно из жилых домов.",
    },
    h2Properties: {
      en: "Browse rental apartments in Davtashen. Listed properties are located on Tigran Petrosyan Street, Anastas Mikoyan Street and Anveher Street. Use the filters to search by price, number of bedrooms or floor area.",
      ru: "Квартиры в аренду в Давташене. Представленные объекты расположены на улице Тиграна Петросяна, улице Анастаса Микояна и улице Анвехер. Используйте фильтры для поиска по цене, количеству спален или площади.",
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
      en: "Nor Nork is a district in the eastern part of Yerevan. The listings on this page include apartments for rent, an apartment for sale and a land plot for sale.",
      ru: "Нор Норк — район в восточной части Еревана. На этой странице — квартиры в аренду, квартира на продажу и земельный участок на продажу.",
      hy: "Նոր Նորքը Երևանի արևելյան հատվածի խոշոր թաղամաս է՝ հայտնի խորհրդային ժամանակաշրջանի շենքերով:",
    },
    seoTitle: {
      en: "Property for Rent and Sale in Nor Nork, Yerevan",
      ru: "Недвижимость в аренду и на продажу в Нор Норке, Ереван",
    },
    h2About: {
      en: "Nor Nork is located on the eastern side of Yerevan. Gyurjyan Street and the 2nd massiv are locations where listed properties are found. Listing 0556 describes the property as approximately seven minutes from Mega Mall.",
      ru: "Нор Норк расположен в восточной части Еревана. Улица Гюрджяна и 2-й массив — районы, где находятся представленные объекты. В объявлении 0556 объект описан как расположенный примерно в семи минутах от Mega Mall.",
    },
    h2Properties: {
      en: "Explore properties in Nor Nork — rental apartments on Gyurjyan Street, a sale apartment in the 2nd massiv, and a land plot for sale. Use the filters to view rent or sale listings separately.",
      ru: "Недвижимость в Нор Норке: квартиры в аренду на улице Гюрджяна, квартира на продажу во 2-м массиве и земельный участок на продажу. Используйте фильтры для просмотра объявлений об аренде или продаже отдельно.",
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
      en: "Ajapnyak is a residential district on the western side of Yerevan. The listings on this page are apartments for rent in Ajapnyak.",
      ru: "Аджапняк — жилой район в западной части Еревана. На этой странице — квартиры в аренду в Аджапняке.",
      hy: "Աջափնյակը Երևանի արևմտյան թաղամաս է՝ խոշոր բնակելի համալիրներով:",
    },
    seoTitle: {
      en: "Apartments for Rent in Ajapnyak, Yerevan",
      ru: "Квартиры в аренду в Аджапняке, Ереван",
    },
    h2About: {
      en: "Ajapnyak is located to the west of Yerevan's centre. Its streets include Halabyan Street and Fuchik Street. One listing in this district refers to the Norashen area by name.",
      ru: "Аджапняк расположен к западу от центра Еревана. Улицы района включают улицу Алабяна и улицу Фучика. В одном объявлении района упоминается район Норашен.",
    },
    h2Properties: {
      en: "Browse rental apartments in Ajapnyak. Listed properties are located on Halabyan Street, Fuchik Street and in the area referred to as Norashen in listing 0541. Use the filters to search by price, number of bedrooms or floor area.",
      ru: "Квартиры в аренду в Аджапняке. Представленные объекты расположены на улице Алабяна, улице Фучика и в районе, упоминаемом как Норашен в объявлении 0541. Используйте фильтры для поиска по цене, количеству спален или площади.",
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
    en: `Real Estate in ${name}, Yerevan — Apartments & Properties`,
    ru: `Недвижимость в районе ${name}, Ереван — Квартиры и объекты`,
    hy: `Անշարժ գույք ${name} թաղամասում, Երևան`,
  };
  const descs: Record<string, string> = {
    en: `Browse apartments, houses and commercial properties for sale and rent in ${name}, Yerevan. Find your ideal property with Yerevan Real Estate.`,
    ru: `Квартиры, дома и коммерческая недвижимость на продажу и в аренду в районе ${name}, Ереван. Найдите идеальный объект с Yerevan Real Estate.`,
    hy: `Բնակարաններ, տներ և առևտրային անշարժ գույք ${name} թաղամասում՝ վաճառքի և վարձակալության։`,
  };
  // EN/RU: use per-district seoTitle and description when available.
  // HY: always use the Armenian template — never fall back to English.
  const title = params.locale !== "hy"
    ? (district.seoTitle?.[lang] ?? titles[params.locale] ?? titles.en)
    : titles.hy;
  const description = params.locale !== "hy"
    ? (district.description?.[lang] ?? descs[params.locale] ?? descs.en)
    : descs.hy;

  const SITE_URL = "https://www.yerevanreal.com";
  const path = `/district/${params.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${params.locale}${path}`,
      languages: {
        en: `${SITE_URL}/en${path}`,
        ru: `${SITE_URL}/ru${path}`,
        hy: `${SITE_URL}/hy${path}`,
        "x-default": `${SITE_URL}/en${path}`,
      },
    },
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

  const { properties } = await getPublicProperties(params.locale);
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
  const h2AboutLabel: Partial<Record<"en" | "ru" | "hy", string>> = {
    en: `About ${name}`,
    ru: `О районе ${name}`,
  };
  const h2PropsLabel: Partial<Record<"en" | "ru" | "hy", string>> = {
    en: `Properties in ${name}`,
    ru: `Недвижимость в районе ${name}`,
  };

  // Intro paragraph shown only for EN/RU when approved text exists.
  // HY description.hy is preserved in data but not rendered until reviewed.
  const introText = params.locale !== "hy" ? district.description?.[lang] : undefined;
  const aboutText = district.h2About?.[lang];
  const propText = district.h2Properties?.[lang];
  const aboutLabel = h2AboutLabel[lang];
  const propLabel = h2PropsLabel[lang];

  const propertyGrid = (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );

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
      {introText && (
        <p className="mt-4 max-w-2xl text-sm text-primary-600 dark:text-white/70 leading-relaxed">
          {introText}
        </p>
      )}

      {aboutText && aboutLabel && (
        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
            {aboutLabel}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-primary-600 dark:text-white/70 leading-relaxed">
            {aboutText}
          </p>
        </section>
      )}

      <div className="mt-8">
        {filtered.length === 0 ? (
          <p className="text-primary-500 dark:text-white/50">{noResults[params.locale] ?? noResults.en}</p>
        ) : propText && propLabel ? (
          <section>
            <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
              {propLabel}
            </h2>
            <p className="mt-3 mb-6 max-w-2xl text-sm text-primary-600 dark:text-white/70 leading-relaxed">
              {propText}
            </p>
            {propertyGrid}
          </section>
        ) : (
          propertyGrid
        )}
      </div>
    </div>
  );
}
