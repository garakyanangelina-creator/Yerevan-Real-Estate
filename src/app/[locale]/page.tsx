import { getTranslations } from "next-intl/server";
import Hero from "@/components/home/Hero";
import DistrictGrid from "@/components/home/DistrictGrid";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import AboutYerevan from "@/components/home/AboutYerevan";
import Testimonials from "@/components/home/Testimonials";
import ContactForm from "@/components/contact/ContactForm";
import PropertyCard from "@/components/property/PropertyCard";
import EmptyState from "@/components/common/EmptyState";
import { Link } from "@/i18n/routing";
import { getFeaturedProperties, getLatestProperties } from "@/services/propertyService";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  const [{ properties: featured, error: featuredError }, { properties: latest, error: latestError }] =
    await Promise.all([getFeaturedProperties(6), getLatestProperties(6)]);

  return (
    <>
      <Hero />

      <section className="container-page py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
            {t("featured")}
          </h2>
          <Link href="/search" className="text-sm font-medium text-gold-600 hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        {featuredError ? (
          <div className="mt-8">
            <EmptyState
              title={tCommon("fetchErrorTitle")}
              message={featuredError === "config" ? tCommon("fetchErrorConfig") : tCommon("fetchErrorNetwork")}
            />
          </div>
        ) : featured.length === 0 ? (
          <p className="mt-8 text-center text-primary-500 dark:text-white/60">{tCommon("noProperties")}</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      <DistrictGrid />

      <section className="container-page py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
            {t("latest")}
          </h2>
          <Link href="/search" className="text-sm font-medium text-gold-600 hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        {latestError ? (
          <div className="mt-8">
            <EmptyState
              title={tCommon("fetchErrorTitle")}
              message={latestError === "config" ? tCommon("fetchErrorConfig") : tCommon("fetchErrorNetwork")}
            />
          </div>
        ) : latest.length === 0 ? (
          <p className="mt-8 text-center text-primary-500 dark:text-white/60">{tCommon("noProperties")}</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary-50 py-16 dark:bg-primary-800/30">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-primary-900 dark:text-white">
              {t("aboutTitle")}
            </h2>
            <p className="mt-4 text-primary-600 dark:text-white/70">{t("aboutText")}</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=900&q=80"
            alt="Yerevan Real Estate office"
            className="rounded-xl2 shadow-soft"
          />
        </div>
      </section>

      <WhyChooseUs />
      <AboutYerevan />
      <Testimonials />

      <section className="container-page py-16" id="contact">
        <h2 className="text-center font-serif text-3xl font-semibold text-primary-900 dark:text-white">
          {t("contactTitle")}
        </h2>
        <div className="mx-auto mt-8 max-w-xl">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
