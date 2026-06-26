import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/mock-data";

export default function Testimonials() {
  const t = useTranslations("home");

  return (
    <section className="container-page py-16">
      <h2 className="text-center font-serif text-3xl font-semibold text-primary-900 dark:text-white">
        {t("testimonialsTitle")}
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {testimonials.map((item) => (
          <div key={item.id} className="card p-6">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image src={item.avatar} alt={item.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-medium text-primary-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-primary-500 dark:text-white/60">{item.role}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-0.5 text-gold-500">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold-500" />
              ))}
            </div>
            <p className="mt-3 text-sm text-primary-600 dark:text-white/70">&ldquo;{item.quote}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
