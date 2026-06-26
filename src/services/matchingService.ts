import type { Client, ClientMatch, MatchResult } from "@/types/client";
import type { Property, PublicProperty } from "@/types/property";

/** Minimum score for a client/property pair to be surfaced as a "match" anywhere in the UI. */
export const MATCH_THRESHOLD = 50;

type MatchableProperty = Property | PublicProperty;

const WEIGHTS = {
  type: 15,
  purpose: 15,
  budget: 20,
  district: 15,
  bedrooms: 10,
  bathrooms: 5,
  area: 10,
  amenities: 10,
} as const;

/**
 * Scores how well a property fits a client's saved search criteria, 0-100.
 *
 * Property type and purpose are always evaluated (every client has one of
 * each). Every other criterion only counts if the client actually specified
 * it — the score is the matched weight as a percentage of the *applicable*
 * weight, not the full weight table. Without this normalization, a client
 * who only cares about type+purpose would still score ~55% from unset
 * fields alone, flooding "matches" with irrelevant properties.
 *
 * Bedroom/bathroom counts use ">=" (a 3-bedroom listing still satisfies a
 * client who asked for 2) rather than an exact match, which is closer to how
 * real estate search usually behaves.
 */
export function calculateMatchScore(property: MatchableProperty, client: Client): MatchResult {
  let earned = 0;
  let applicable = 0;
  const reasons: string[] = [];

  applicable += WEIGHTS.type;
  if (property.type === client.propertyType) {
    earned += WEIGHTS.type;
    reasons.push("reasonType");
  }

  applicable += WEIGHTS.purpose;
  if (property.purpose === client.purpose) {
    earned += WEIGHTS.purpose;
    reasons.push("reasonPurpose");
  }

  if (client.minBudget != null || client.maxBudget != null) {
    applicable += WEIGHTS.budget;
    if (property.price > 0) {
      const min = client.minBudget ?? -Infinity;
      const max = client.maxBudget ?? Infinity;
      if (property.price >= min && property.price <= max) {
        earned += WEIGHTS.budget;
        reasons.push("reasonBudget");
      }
    }
  }

  if (client.preferredDistricts.length > 0) {
    applicable += WEIGHTS.district;
    if (client.preferredDistricts.includes(property.district)) {
      earned += WEIGHTS.district;
      reasons.push("reasonDistrict");
    }
  }

  if (client.bedrooms != null) {
    applicable += WEIGHTS.bedrooms;
    if (property.bedrooms >= client.bedrooms) {
      earned += WEIGHTS.bedrooms;
      reasons.push("reasonBedrooms");
    }
  }

  if (client.bathrooms != null) {
    applicable += WEIGHTS.bathrooms;
    if (property.bathrooms >= client.bathrooms) {
      earned += WEIGHTS.bathrooms;
      reasons.push("reasonBathrooms");
    }
  }

  if (client.minArea != null || client.maxArea != null) {
    applicable += WEIGHTS.area;
    if (property.area > 0) {
      const min = client.minArea ?? -Infinity;
      const max = client.maxArea ?? Infinity;
      if (property.area >= min && property.area <= max) {
        earned += WEIGHTS.area;
        reasons.push("reasonArea");
      }
    }
  }

  const amenityChecks: boolean[] = [];
  if (client.parkingRequired) amenityChecks.push(property.amenities.parking);
  if (client.elevatorRequired) amenityChecks.push(property.amenities.elevator);
  if (client.balconyRequired) amenityChecks.push(property.amenities.balcony);
  if (client.petsAllowed) amenityChecks.push(property.amenities.petFriendly);
  if (client.furnished === "furnished") amenityChecks.push(property.amenities.furniture);
  if (client.furnished === "unfurnished") amenityChecks.push(!property.amenities.furniture);

  if (amenityChecks.length > 0) {
    applicable += WEIGHTS.amenities;
    const satisfied = amenityChecks.filter(Boolean).length;
    const fraction = satisfied / amenityChecks.length;
    earned += WEIGHTS.amenities * fraction;
    if (satisfied === amenityChecks.length) reasons.push("reasonAmenities");
  }

  const score = applicable > 0 ? Math.round((earned / applicable) * 100) : 0;
  return { score, reasons };
}

export function findMatchingClients(
  property: MatchableProperty,
  clients: Client[],
  threshold = MATCH_THRESHOLD
): ClientMatch[] {
  return clients
    .map((client) => ({ client, ...calculateMatchScore(property, client) }))
    .filter((match) => match.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

export function findMatchingProperties<T extends MatchableProperty>(
  client: Client,
  properties: T[],
  threshold = MATCH_THRESHOLD
): Array<MatchResult & { property: T }> {
  return properties
    .map((property) => ({ property, ...calculateMatchScore(property, client) }))
    .filter((match) => match.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
