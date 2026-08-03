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
    <section className="py-20">
      <div className="container-page">
        {/* Header */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-gold-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold-700 dark:bg-gold-900/30 dark:text-gold-300">
              Why Yerevan?
            </span>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-snug text-primary-900 dark:text-white sm:text-4xl">
              Discover the City<br />Behind Every Listing
            </h2>
            <p className="mt-4 text-primary-600 dark:text-white/70 leading-relaxed">
              Yerevan is more than just an address — it&apos;s a lifestyle. From its
              stunning views of Mount Ararat to its thriving café culture and
              fast-growing property market, Yerevan offers something truly special
              for residents and investors alike.
            </p>
            <div className="mt-6 flex gap-8">
              <div>
                <p className="text-3xl font-bold text-gold-500">782 BC</p>
                <p className="mt-1 text-sm text-primary-500 dark:text-white/60">Year founded</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gold-500">1.1M+</p>
                <p className="mt-1 text-sm text-primary-500 dark:text-white/60">Population</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gold-500">300+</p>
                <p className="mt-1 text-sm text-primary-500 dark:text-white/60">Sunny days/year</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="/ararat.jpg"
              alt="Mount Ararat view from Yerevan"
              className="rounded-2xl shadow-premium object-cover w-full h-72 lg:h-96"
            />
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-soft dark:bg-primary-800">
              <p className="text-xs font-semibold text-primary-500 dark:text-white/60 uppercase tracking-wide">View</p>
              <p className="mt-0.5 font-serif text-lg font-semibold text-primary-900 dark:text-white">Mount Ararat</p>
            </div>
          </div>
        </div>

        {/* Fact cards */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div
              key={fact.title}
              className="card group flex gap-4 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-premium"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50 dark:bg-gold-900/20">
                <fact.icon className="h-5 w-5 text-gold-500" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900 dark:text-white">{fact.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-primary-500 dark:text-white/60">{fact.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
