# Architecture & Implementation Notes

Deeper technical detail that doesn't belong in the top-level README. Read this if
you're working on the codebase rather than just running it.

## Apify integration

- **`src/lib/apify.ts`** — low-level fetch wrapper. Resolves either `APIFY_DATASET_ID`
  directly, or the last successful run's dataset for `APIFY_ACTOR_ID`. Sends the token
  via the `Authorization` header (not the URL), and uses Next.js's `fetch` cache
  (`next: { revalidate: 300 }` by default) so we don't hit the Apify API on every request.
- **`src/services/propertyService.ts`** — maps raw Apify dataset items onto the internal
  `Property` model (`src/types/property.ts`), with alias tables for property type /
  purpose / district naming variations an actor might use. Exposes the only functions
  pages should call: `getFeaturedProperties`, `getLatestProperties`,
  `getPublicPropertyById`, `getSimilarPublicProperties`, `getPublicProperties` (all
  return *public*, phone-stripped data), and `getAdminProperties` (full data,
  admin-only). Wrapped in React's `cache()` so one request only hits Apify once even
  if multiple components need the data.
- Nothing calls the Apify API directly from a Client Component — all fetching happens
  in Server Components / Route Handlers.
- Errors never throw up into a page. Every service function returns
  `{ properties, error }` where `error` is `"config" | "network" | null`; pages render
  a translated empty-state instead of any fallback data when it's non-null.

### Expected Apify dataset fields

The mapper in `propertyService.ts` is tolerant of common naming variations (e.g. `lat`
or `latitude`, `photos` or `images`, `type` or `propertyType`). At minimum it
understands:

`title`, `description`, `price`, `currency`, `district` (or `neighborhood`), `address`,
`latitude`/`longitude` (or `lat`/`lng`), `bedrooms`, `bathrooms`, `area` (or `size`),
`floor`, `totalFloors`, `propertyType` (or `type`), `listingType` (or `purpose`),
`images` (or `photos`), `amenities` (array of strings, or an object matching
`PropertyAmenities`), `contactPhone` (or `ownerPhone`/`phone`), `ownerName`,
`createdAt`/`publishedAt`, `featured`, `popularity`/`views`.

If the dataset is unstructured (e.g. Instagram post scraper output), the same file also
parses Armenian-language captions for price/area/floor/room-count/district/address via
regex (see `parsePriceFromText` and friends) as a fallback when explicit fields are
absent.

Unrecognized district names map to `"other"`. Missing numeric fields default to `0`.

## Owner phone number privacy

- `toPublicProperty()` in `src/types/property.ts` strips `ownerPhone` / `ownerName`
  from every property before it reaches a public page or component. Visitors only ever
  see Contact Agency / WhatsApp / Call Agency / Request Viewing — never a raw owner
  number.
- The Admin Dashboard is the only place raw owner phone numbers are rendered, and only
  after a valid admin session.
- **Admin auth is real but lightweight** (`src/lib/adminAuth.ts`): `/api/admin/login`
  checks `ADMIN_USERNAME`/`ADMIN_PASSWORD` and sets an HMAC-signed, httpOnly session
  cookie; every admin route verifies that cookie before responding. There's no
  database-backed user table or RBAC yet — treat this as a stopgap (see Roadmap in the
  README) before handling real users at scale.

## Client CRM and property matching

The admin panel (`/admin/clients`) lets staff register buyer/renter requirements and
see which live Apify listings fit each client, and vice versa.

- **Storage**: `prisma/schema.prisma` defines `Client`, `Notification`, and
  `SeenProperty` in a local SQLite database (`prisma/dev.db`) — no external DB server
  required. Properties themselves are *not* duplicated into this database; they're
  still fetched live from Apify on every request. `SeenProperty` just tracks which
  property ids have already been processed for matching, so "new" listings can be
  detected across requests.
- **`src/services/clientService.ts`** — CRUD + search/filter/archive for clients.
- **`src/services/matchingService.ts`** — `calculateMatchScore(property, client)`
  returns a 0-100 score plus the list of matched-criteria reason keys (translated in
  the UI, e.g. "Budget matches"). Property type and purpose are always scored; every
  other criterion (budget, district, bedrooms, bathrooms, area, amenities) only counts
  toward the score *if the client specified it* — the score is matched weight ÷
  applicable weight, not matched ÷ total. This matters: without that normalization, a
  client with few requirements would score ~55% on every property from unset fields
  alone, flooding every list with irrelevant "matches." `MATCH_THRESHOLD` (50) is the
  minimum score shown anywhere as a "match." Bedroom/bathroom counts use `>=`, not
  exact match.
- **`src/services/notificationService.ts`** — there's no persisted property table or
  Apify webhook to react to in real time, so "whenever a new property is imported" is
  implemented as: whenever an admin loads `/api/admin/notifications` (the dashboard's
  bell icon polls this), diff the live Apify set against `SeenProperty`, and for
  anything new, compute matches against active clients and create a `Notification` row
  if any client matches. This is a deliberate scope decision for a project with no
  persisted property store or job runner — wire this to a scheduled job or an Apify
  webhook later for true real-time notifications.
- **UI**: `/admin/clients` (list, search, filter by status/type/purpose, add/edit
  modal, archive, delete) and `/admin/clients/[id]` (client profile + matching
  properties sorted by score). The admin dashboard's properties table has a "Matching
  Clients" button per property that opens a modal with each match's score, matched
  reasons, and Call/WhatsApp/Email buttons. A notification bell in the shared
  `AdminNav` shows unread "New property matches N clients" entries; clicking one marks
  it read and jumps to that property's matches.
- **Future automation (not implemented)**: `src/services/notificationDispatchService.ts`
  is a stub with `sendWhatsAppMessage` / `sendEmail` / `sendSms` functions that
  currently just return "not implemented" — the seam is there for wiring real
  providers later.
- **Access control**: every CRM route checks `hasValidAdminSession()`, same as the
  properties endpoint. There's still only one admin role (no separate "agency staff"
  role yet) — add a `role` column to a real `User` table when that's built.
- **Public site unchanged**: none of this touches Home/Search/Property/Submit/Contact —
  client data and matching only exist behind `/admin/*` routes.

## Project structure

```
src/
  app/[locale]/                route segments (home, search, property/[id], submit, contact,
                                 admin, admin/clients, admin/clients/[id])
  app/api/admin/               login/logout/properties + clients/notifications route handlers
  components/                  layout, home, search, property, contact, common, admin components
  i18n/                        next-intl routing + request config
  lib/apify.ts                  low-level Apify API fetch wrapper
  lib/adminAuth.ts              signed admin session cookie helpers
  lib/prisma.ts                  Prisma client singleton
  lib/mock-data.ts              non-property data only: districts, district centers, testimonials
  services/propertyService.ts   Apify -> Property mapping + all property query functions
  services/clientService.ts     Client CRUD (Prisma/SQLite)
  services/matchingService.ts   property/client match scoring
  services/notificationService.ts   new-property detection + Notification CRUD
  services/notificationDispatchService.ts   WhatsApp/Email/SMS stubs (future work)
  messages/                     en.json, ru.json, hy.json translation files
  types/property.ts             shared types + toPublicProperty() phone-stripping helper
  types/client.ts                Client/ClientInput/MatchResult types

prisma/schema.prisma            Client, Notification, SeenProperty models (SQLite)
```
