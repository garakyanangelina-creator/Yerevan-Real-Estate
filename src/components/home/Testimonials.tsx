import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/mock-data";

export default function Testimonials() {
  const t = useTranslations("home");

  return (
    <section className="container-page py-10 sm:py-16">
      <h2 className="text-center font-serif text-2xl font-semibold text-primary-900 dark:text-white sm:text-3xl">
        {t("testimonialsTitle")}
      </h2>
      <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <div key={item.id} className="card p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full sm:h-12 sm:w-12">
                <Image src={item.avatar} alt={item.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-900 dark:text-white sm:text-base">{item.name}</p>
                <p className="text-xs text-primary-500 dark:text-white/60">{item.role}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-0.5 text-gold-500">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold-500 sm:h-4 sm:w-4" />
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-primary-600 dark:text-white/70 sm:text-sm">&ldquo;{item.quote}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
