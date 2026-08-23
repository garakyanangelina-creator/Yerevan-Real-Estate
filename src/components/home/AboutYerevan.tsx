import { Building2, Sun, Users, MapPin, TrendingUp, Heart } from "lucide-react";

const facts = [
  {
    icon: MapPin,
    title: "Capital of Armenia",
    text: "Yerevan is the political, cultural and economic heart of Armenia — a vibrant city of over 1.1 million people.",
  },
  {
    icon: Building2,
    title: "The Pink City",
    text: "Built from volcanic tuff stone, Yerevan's architecture glows pink and golden at sunset — unlike any other city in the world.",
  },
  {
    icon: Sun,
    title: "300+ Sunny Days",
    text: "Yerevan enjoys one of the most pleasant climates in the region — warm summers, mild winters and over 300 sunny days a year.",
  },
  {
    icon: TrendingUp,
    title: "Fast-Growing Economy",
    text: "A booming IT sector, low taxes and rising foreign investment make Yerevan one of the most attractive cities for real estate.",
  },
  {
    icon: Users,
    title: "Safe & Welcoming",
    text: "Consistently ranked among the safest cities in the region. Expats, students and families all feel at home here.",
  },
  {
    icon: Heart,
    title: "Rich Culture & History",
    text: "Founded in 782 BC, Yerevan blends ancient history with modern energy — museums, cafés, theatres and world-class cuisine.",
  },
];

export default function AboutYerevan() {
  return (
    <section className="py-12 sm:py-20">
      <div className="container-page">
        {/* Header — stacks on mobile, side-by-side on lg */}
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-gold-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold-700 dark:bg-gold-900/30 dark:text-gold-300">
              Why Yerevan?
            </span>
            <h2 className="mt-4 font-serif text-2xl font-semibold leading-snug text-primary-900 dark:text-white sm:text-3xl sm:text-4xl">
              Discover the City<br />Behind Every Listing
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-primary-600 dark:text-white/70 sm:text-base">
              Yerevan is more than just an address — it&apos;s a lifestyle. From its
              stunning views of Mount Ararat to its thriving café culture and
              fast-growing property market, Yerevan offers something truly special
              for residents and investors alike.
            </p>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6 sm:gap-8">
              <div>
                <p className="text-2xl font-bold text-gold-500 sm:text-3xl">782 BC</p>
                <p className="mt-1 text-xs text-primary-500 dark:text-white/60 sm:text-sm">Year founded</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gold-500 sm:text-3xl">1.1M+</p>
                <p className="mt-1 text-xs text-primary-500 dark:text-white/60 sm:text-sm">Population</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gold-500 sm:text-3xl">300+</p>
                <p className="mt-1 text-xs text-primary-500 dark:text-white/60 sm:text-sm">Sunny days/year</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative pb-6 pl-0 sm:pb-8">
            <img
              src="/ararat.jpg"
              alt="Mount Ararat view from Yerevan"
              className="w-full rounded-2xl object-cover shadow-premium"
              style={{ height: "280px" }}
            />
            <div className="absolute bottom-0 left-4 rounded-xl bg-white p-3 shadow-soft dark:bg-primary-800 sm:bottom-0 sm:left-0 sm:p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-white/60">View</p>
              <p className="mt-0.5 font-serif text-base font-semibold text-primary-900 dark:text-white sm:text-lg">Mount Ararat</p>
            </div>
          </div>
        </div>

        {/* Fact cards */}
        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {facts.map((fact) => (
            <div
              key={fact.title}
              className="card group flex gap-4 p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-premium sm:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-50 dark:bg-gold-900/20 sm:h-11 sm:w-11">
                <fact.icon className="h-5 w-5 text-gold-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-900 dark:text-white sm:text-base">{fact.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-primary-500 dark:text-white/60 sm:text-sm">{fact.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
