# Yerevan Real Estate

A modern, multilingual real estate website for Yerevan, Armenia — built with Next.js,
TypeScript, and Tailwind CSS. Listings are pulled live from a data source via
[Apify](https://apify.com), and the agency manages everything through a built-in admin
panel with a lightweight client CRM and automatic property-matching engine.

## Features

**For visitors**

- Browse live apartment, house, commercial, office, and land listings across every
  district of Yerevan
- Full search with filters (type, purpose, price, district, bedrooms, bathrooms, area,
  amenities) and sorting
- Rich property pages — photo gallery, map, amenities, similar listings
- Submit a property for the agency to list, or send a contact inquiry
- Fully bilingual — switch instantly between **English**, **Russian**, and **Armenian**
- Light/dark mode, responsive on every screen size

**For the agency (admin panel)**

- Secure admin login and dashboard of all live listings
- Owner phone numbers are private by default — visitors only ever see "Contact Agency,"
  WhatsApp, and "Request Viewing." Only signed-in admins can reveal a number.
- A built-in **client CRM**: register what a buyer or renter is looking for (budget,
  district, bedrooms, amenities, etc.)
- **Automatic matching** between clients and listings, with a 0–100% match score and a
  plain-language breakdown of why something matched
- Notifications when a newly imported property matches one or more clients

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 14](https://nextjs.org) (App Router) + TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Internationalization | [next-intl](https://next-intl.dev) |
| Listings data | [Apify](https://apify.com) |
| CRM database | [Prisma](https://www.prisma.io) + SQLite |
| Icons | [lucide-react](https://lucide.dev) |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values, see below
npx prisma migrate dev             # creates the local CRM database
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/en`, `/ru`, or `/hy`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `APIFY_TOKEN` | yes | Apify API token used to read the listings dataset. |
| `APIFY_ACTOR_ID` or `APIFY_DATASET_ID` | one of these | Where listings come from — either an actor's latest run, or one fixed dataset. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | yes | Admin panel login. Change before deploying. |
| `ADMIN_SESSION_SECRET` | yes | Signs the admin session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `DATABASE_URL` | yes | CRM database location. Defaults to a local SQLite file. |

Full details and comments are in `.env.local.example`. Without Apify configured, the
site shows a friendly "not configured yet" message instead of any placeholder data.

## Documentation

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for implementation details: how
Apify data is mapped and cached, how owner phone privacy is enforced, and how the
client-matching engine and notifications work.

## Roadmap

- Full role-based admin accounts (admin / agency staff / property owner)
- Persisted submission and contact-request backend
- Image upload pipeline for owner-submitted listings
- Automated WhatsApp/Email/SMS delivery to matched clients (the matching engine and
  data model are ready; sending isn't wired up yet)
