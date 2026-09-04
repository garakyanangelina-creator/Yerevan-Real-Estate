export type PropertyType = "apartment" | "house" | "commercial" | "office" | "land";
export type Purpose = "rent" | "sale";
export type District =
  | "kentron"
  | "arabkir"
  | "davtashen"
  | "ajapnyak"
  | "shengavit"
  | "kanakerZeytun"
  | "norNork"
  | "malatiaSebastia"
  | "avan"
  | "erebuni"
  | "norkMarash"
  | "nubarashen"
  | "other";

export interface PropertyAmenities {
  parking: boolean;
  balcony: boolean;
  furniture: boolean;
  petFriendly: boolean;
  newBuilding: boolean;
  elevator: boolean;
  ac: boolean;
  heating: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  purpose: Purpose;
  district: District;
  address: string;
  price: number;
  currency: string;
  bedrooms: number; // 0 = studio
  bathrooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  images: string[];
  amenities: PropertyAmenities;
  featured: boolean;
  popularity: number;
  createdAt: string;
  lat: number;
  lng: number;
  listingCode?: number;
  /** Owner phone is private. Never sent to client-facing components. */
  ownerPhone: string;
  ownerName: string;
}

export interface PublicProperty extends Omit<Property, "ownerPhone" | "ownerName"> {}

export function toPublicProperty(property: Property): PublicProperty {
  const { ownerPhone, ownerName, ...rest } = property;
  return rest;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

export interface PropertySubmission {
  name: string;
  phone: string;
  email: string;
  propertyType: PropertyType;
  purpose: Purpose;
  address: string;
  district: District;
  price: number;
  description: string;
  photos: File[];
}

export interface ContactRequest {
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyId?: string;
}

/** Why a live property fetch came back empty, surfaced as a translated message instead of mock data. */
export type PropertyFetchErrorCode = "config" | "network" | null;

export interface PropertyFetchResult<T> {
  properties: T[];
  error: PropertyFetchErrorCode;
}
