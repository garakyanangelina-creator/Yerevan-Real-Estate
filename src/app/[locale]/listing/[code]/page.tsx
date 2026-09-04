import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Gallery from "@/components/property/Gallery";
import PropertyMap from "@/components/property/PropertyMap";
import ContactButtons from "@/components/property/ContactButtons";
import PropertyCard from "@/components/property/PropertyCard";
import EmptyState from "@/components/common/EmptyState";
import { getPublicPropertyByCode, getSimilarPublicProperties } from "@/services/propertyService";
import { formatPrice } from "@/lib/utils";
import CopyLinkButton from "@/components/property/CopyLinkButton";
import { BedDouble, Bath, Ruler, Building2, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const { property } = await getPublicPropertyByCode(code);
  if (!property) return {};
  return {
    title: property.title,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.images.length ? [property.images[0]] : [],
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { property, error } = await getPublicPropertyByCode(code);

  const tCommon = await getTranslations("common");

  if (error) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title={tCommon("fetchErrorTitle")}
          message={tCommon("fetchErrorNetwork")}
        />
      </div>
    );
  }

  if (!property) notFound();

  const t = await getTranslations("property");
  const tTypes = await getTranslations("propertyTypes");
  const tPurpose = await getTranslations("purpose");
  const tDistricts = await getTranslations("districts");
  const tAmenities = await getTranslations("search");

  const similar = await getSimilarPublicProperties(property);

  const amenityList = (Object.keys(property.amenities) as (keyof typeof property.amenities)[]).filter(
    (key) => property.amenities[key]
  );

  const displayCode = property.listingCode
    ? String(property.listingCode).padStart(4, "0")
    : code;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    image: property.images,
    address: {
      "@type": "PostalAddress",
      // streetAddress intentionally omitted — building number is private
      addressLocality: "Yerevan",
      addressCountry: "AM",
    },
  };

  return (
    <div className="container-page py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Gallery images={property.images} title={property.title} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-primary-50 px-2 py-0.5 text-xs font-mono font-semibold text-primary-500 dark:bg-white/10 dark:text-white/60">
                  #{displayCode}
                </span>
                <CopyLinkButton code={displayCode} />
              </div>
              <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
                {property.title}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-primary-500 dark:text-white/60">
                <MapPin className="h-4 w-4" /> {tDistricts(property.district)}, Yerevan
              </p>
            </div>
            <p className="text-2xl font-semibold text-gold-600">
              {formatPrice(property.price, property.purpose, property.currency)}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 rounded-xl2 bg-primary-50 p-5 text-sm text-primary-700 dark:bg-primary-800/40 dark:text-white/80">
            <span className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" /> {property.bedrooms === 0 ? t("studio") : `${property.bedrooms} ${property.bedrooms === 1 ? t("bed") : t("beds")}`}
            </span>
            <span className="flex items-center gap-2">
              <Bath className="h-4 w-4" /> {property.bathrooms} {property.bathrooms === 1 ? t("bath") : t("baths")}
            </span>
            <span className="flex items-center gap-2">
              <Ruler className="h-4 w-4" /> {property.area} m²
            </span>
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> {t("floorLabel")} {property.floor}/{property.totalFloors}
            </span>
          </div>

          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
              {t("description")}
            </h2>
            <p className="mt-3 leading-relaxed text-primary-600 dark:text-white/70">
              {property.description}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
              {t("amenities")}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-primary-700 sm:grid-cols-3 dark:text-white/70">
              {amenityList.map((key) => (
                <span key={key} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" /> {tAmenities(key)}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
              {t("location")}
            </h2>
            <div className="mt-3">
              <PropertyMap lat={property.lat} lng={property.lng} title={property.title} />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
              {t("info")}
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-primary-400">{t("id")}</dt>
                <dd className="font-medium text-primary-800 dark:text-white">#{displayCode}</dd>
              </div>
              <div>
                <dt className="text-primary-400">{t("type")}</dt>
                <dd className="font-medium text-primary-800 dark:text-white">{tTypes(property.type)}</dd>
              </div>
              <div>
                <dt className="text-primary-400">{t("purpose")}</dt>
                <dd className="font-medium text-primary-800 dark:text-white">{tPurpose(property.purpose)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ContactButtons propertyId={property.id} />
          <div className="card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-400 dark:text-white/40">
              Share this listing
            </p>
            <CopyLinkButton code={displayCode} fullWidth />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-primary-900 dark:text-white">
            {t("similar")}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
