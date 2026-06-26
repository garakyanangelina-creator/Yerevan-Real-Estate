import type { District, PropertyType, Purpose } from "./property";

export type ClientStatus = "active" | "paused" | "closed";
export type FurnishedPreference = "any" | "furnished" | "unfurnished";
export type PreferredLanguage = "en" | "ru" | "hy";

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  preferredLanguage: PreferredLanguage;
  propertyType: PropertyType;
  purpose: Purpose;
  preferredDistricts: District[];
  minBudget: number | null;
  maxBudget: number | null;
  minArea: number | null;
  maxArea: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  furnished: FurnishedPreference;
  petsAllowed: boolean;
  parkingRequired: boolean;
  elevatorRequired: boolean;
  balconyRequired: boolean;
  notes: string | null;
  status: ClientStatus;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Shape submitted from the client form — everything optional except the required basics. */
export interface ClientInput {
  fullName: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  preferredLanguage: PreferredLanguage;
  propertyType: PropertyType;
  purpose: Purpose;
  preferredDistricts: District[];
  minBudget?: number | null;
  maxBudget?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furnished: FurnishedPreference;
  petsAllowed?: boolean;
  parkingRequired?: boolean;
  elevatorRequired?: boolean;
  balconyRequired?: boolean;
  notes?: string | null;
  status?: ClientStatus;
}

export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
  propertyType?: PropertyType;
  purpose?: Purpose;
  includeArchived?: boolean;
}

export interface MatchResult {
  score: number; // 0-100
  reasons: string[]; // translation keys for matched criteria, e.g. "matching.reasonBudget"
}

export interface ClientMatch extends MatchResult {
  client: Client;
}
