import type { District, Testimonial } from "@/types/property";

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

/** The 12 official Yerevan districts surfaced in filters and the homepage district grid. */
export const districts: District[] = [
  "kentron",
  "arabkir",
  "davtashen",
  "ajapnyak",
  "shengavit",
  "kanakerZeytun",
  "norNork",
  "malatiaSebastia",
  "avan",
  "erebuni",
  "norkMarash",
  "nubarashen",
];

/** Approximate centers used as a fallback when a listing has no lat/lng of its own. */
export const districtCenters: Record<District, { lat: number; lng: number }> = {
  kentron: { lat: 40.1814, lng: 44.5144 },
  arabkir: { lat: 40.2031, lng: 44.5089 },
  davtashen: { lat: 40.2225, lng: 44.4811 },
  ajapnyak: { lat: 40.1953, lng: 44.4631 },
  shengavit: { lat: 40.1531, lng: 44.4889 },
  kanakerZeytun: { lat: 40.2086, lng: 44.5497 },
  norNork: { lat: 40.1958, lng: 44.5764 },
  malatiaSebastia: { lat: 40.1764, lng: 44.4567 },
  avan: { lat: 40.2192, lng: 44.5453 },
  erebuni: { lat: 40.1392, lng: 44.4994 },
  norkMarash: { lat: 40.1664, lng: 44.5469 },
  nubarashen: { lat: 40.1364, lng: 44.5589 },
  other: { lat: 40.1814, lng: 44.5144 },
};

// Testimonials are editorial content, not property listings, so they stay as
// local placeholder data until the admin panel can manage them (see README).
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Anna Petrosyan",
    role: "Bought an apartment in Kentron",
    quote:
      "The team made the entire buying process smooth and transparent. Highly recommend for anyone looking in Yerevan.",
    avatar: img("photo-1494790108377-be9c29b29330"),
    rating: 5,
  },
  {
    id: "t2",
    name: "Davit Harutyunyan",
    role: "Rented an office in Arabkir",
    quote:
      "Fast responses and verified listings. We found our office space within a week.",
    avatar: img("photo-1507003211169-0a1dd7228f2d"),
    rating: 5,
  },
  {
    id: "t3",
    name: "Mariam Sargsyan",
    role: "Sold a family house",
    quote:
      "Professional, trustworthy, and they protected our privacy throughout the whole process.",
    avatar: img("photo-1438761681033-6461ffad8d80"),
    rating: 4,
  },
];
