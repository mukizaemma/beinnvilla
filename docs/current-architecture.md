# Current architecture audit — BE Inn Villa / Ireme Starter (Phase 1)

**Date:** 21 August 2026  
**Scope:** Inspect only. No major architecture changes in this phase.  
**Actual folders:** `backend/` and `frontend/` (not `dev-frontend/`). The intern layout `apps/cms` + `apps/web` was already renamed.

This document is the Phase 1 stop point. Phase 2 (target architecture + migration plan) must not start until this audit is reviewed.

---

## 1. Current structure

```text
beinnvilla/
├── backend/                 # Payload CMS 3 + Next.js 16 (admin, REST, payments)
│   ├── src/
│   │   ├── collections/     # Users, Media, Rooms, GalleryPhotos, Bookings, Experiences
│   │   ├── globals/         # Company, Navigation, page content
│   │   ├── lib/             # stripeClient, momoClient, cors
│   │   ├── components/payload/  # admin logo/icon
│   │   └── app/(payload)/   # Next App Router: admin UI + REST catch-all + payment routes
│   ├── storage/media/       # local uploads (Sharp derivatives live here too)
│   ├── public/
│   ├── payload.config.js
│   ├── next.config.js
│   └── .env.example
├── frontend/                # Vite + React 19 public hotel website
│   ├── src/
│   │   ├── pages/
│   │   ├── sections/
│   │   ├── components/
│   │   ├── lib/             # apiClient, queries, cart, booking, adapters
│   │   ├── data/            # leftover static content (partially still imported)
│   │   ├── hooks/
│   │   ├── router/
│   │   └── styles/
│   ├── public/images/       # leftover static assets from pre-CMS era
│   └── .env.example
├── docs/
├── package.json             # convenience scripts only (not a real workspace)
└── README.md
```

There is **one git repository**. The two apps communicate over HTTP only (`VITE_CMS_URL` → Payload REST). They do not import each other from disk.

There is **no** Express `controllers/services/repositories` tree, **no** custom management dashboard SPA, **no** tests, **no** Docker/nginx/CI, **no** seed scripts.

---

## 2. Current technologies

### Backend (`beinnvilla-backend`)

| Piece | Version / choice |
|---|---|
| Payload CMS | 3.86.0 |
| Next.js | 16.2.12 (App Router, `withPayload`) |
| React (admin) | 19.2.8 |
| Database adapter | `@payloadcms/db-mongodb` 3.86.0 (Mongoose) |
| Rich text | `@payloadcms/richtext-lexical` 3.86.0 (unused on most hotel fields; fields are text/textarea) |
| Images | `sharp` 0.35.3 |
| Payments | `stripe` ^22.4.0; MTN MoMo via raw `fetch` |
| GraphQL | `graphql` 16.14.2 (Payload GraphQL is available; unused by the frontend) |
| Language | JavaScript (ESM). **Not TypeScript.** |

Scripts: `dev` (`next dev --turbo`), `build`, `start`, `payload`.

### Frontend (`beinnvilla-frontend`)

| Piece | Version / choice |
|---|---|
| Vite | ^8.1.1 |
| React | ^19.2.7 |
| React Router | ^7.18.1 |
| TanStack Query | ^5.101.4 |
| Axios | ^1.19.0 |
| Stripe.js | `@stripe/stripe-js` ^9.13.0 + `@stripe/react-stripe-js` |
| Email | `@emailjs/browser` ^4.4.1 |
| Toasts | `sonner` |
| Icons | `lucide-react` |
| Lint | `oxlint` |
| Language | JavaScript + CSS modules. **Not TypeScript.** Path aliases via `vite.config.js` / `jsconfig.json`. |

### What is *not* present

Laravel/Express-style MVC, Redis, queues, websockets, Kubernetes, multi-tenancy, Prisma, MySQL, PHP, XAMPP runtime, Helmet, rate limiting, Zod/Yup, Pino/Winston, Jest/Vitest/Playwright, sitemap, robots.txt, Open Graph, JSON-LD.

---

## 3. Current database

### Technology and connection

- **MongoDB** via Payload’s Mongoose adapter.
- Connection string: `process.env.MONGODB_URI` or `process.env.DATABASE_URI` in `backend/payload.config.js`.
- `.env` and `.env.example` use MongoDB database `beinnvilla` (`mongodb://127.0.0.1:27017/beinnvilla` locally, or the Atlas URI with the same database name).
- Atlas is compatible. `MONGODB_URI` is the name in `.env`. `DATABASE_URI` still works as a fallback.
- No connection helper of our own — Payload opens the pool.
- No explicit Mongoose index definitions beyond Payload `unique: true` on `rooms.slug` and `experiences.slug`.
- No migrations (Mongo adapter is schema-from-config).

### Collections (tables)

| Slug | Purpose | Key fields | Access | Indexes |
|---|---|---|---|---|
| `users` | Staff login for Payload admin | Payload auth fields + `name` | Auth collection (Payload defaults) | Payload auth indexes (email unique) |
| `media` | Uploads | `alt`, file, `sizes` (thumbnail/card/hero) | `read: public`; writes default to authenticated | Payload upload indexes |
| `rooms` | Bookable rooms | `slug`, `name`, `pricePerNight`, `description`, `specs` group, `features[]`, `image`, `gallery[]` | `read: public` | unique `slug` |
| `experiences` | Add-on activities | `slug`, `name`, `price` (flat), `description`, `image` | `read: public` | unique `slug` |
| `gallery-photos` | Gallery grid | `category`, `caption`, `aspect`, `photo` | `read: public` | none extra |
| `bookings` | Reservations | snapshotted `rooms[]` / `experiences[]`, dates, guest group, `paymentMethod`, `confirmationMethod`, `total`, `status`, `paymentStatus`, `paymentMeta` | **create: public**; read/update/delete: logged-in user | none extra (no index on dates, payment ids, or status) |

**Relationships:** rooms/experiences/gallery/pages relate to `media` via upload fields. Bookings **do not** relate to rooms — they snapshot `roomId`/`name`/`pricePerNight` as plain text/numbers so historical price does not drift.

There is **no** `guests`, `stock`, `pos`, `notifications`, `auditLogs`, `settings`, `roles`, `permissions`, or `files` collection beyond `media`.

### Globals (singletons)

| Slug | Role |
|---|---|
| `company` | Name, tagline, phone, email, address, distance, map URL, socials |
| `navigation` | `primaryNav[]` (label/path), `navCTA` |
| `home-page` | Hero slides, stats, welcome, bar spotlight, amenities, CTA, video showcase |
| `rooms-page` | Hero + highlight chips |
| `bar-restaurant-page` | Hero/video, hours, panels, menu, video showcase |
| `gallery-page` | Eyebrow/headline/intro |
| `contact-page` | Hero + notes (frontend **does not consume this**) |
| `about-page` | Hero, story, values, CTA |

All globals: `read: () => true`. Writes: Payload default (authenticated admin).

### Payload-generated API documents

Every collection also has Payload internals (`createdAt`, `updatedAt`, versions if enabled — versions are **not** enabled).

---

## 4. Current authentication

**Only Payload admin authentication exists.** There is no guest account system and no custom Ireme auth API (`/api/v1/auth`).

- Collection `users` has `auth: true`. Payload hashes passwords (bcrypt via Payload). Extra field: `name` (single string, not first/last).
- Missing vs Ireme user spec: first name, last name, phone, avatar, status, roles, last login (Payload may store some session metadata internally, but not as a first-class `lastLogin` field).
- **No roles/permissions model.** Any logged-in user is a full admin.
- Login/logout/password change live in Payload’s admin UI at `/admin`, not on the public site.
- Payload already exposes `/api/users/login`, `/logout`, `/me`, `/forgot-password`, `/reset-password`, `/refresh-token`. Ireme “prepare password reset” can reuse these rather than inventing a second auth API.
- Public website has **zero** auth state. Booking is anonymous.
- First user is created via Payload’s first-register flow when the DB has no users.
- JWT/session cookies are Payload’s, scoped to the CMS origin (`localhost:3000`), not the Vite origin (`localhost:5173`).

**Authorization on data:**

- Marketing collections: public read; implied authenticated write.
- `bookings.create`: **anyone on the internet**.
- `bookings.status` / `paymentStatus`: guests cannot set them on create (`create: () => false` at field level). Staff can update later. Payment routes update `paymentStatus` via Local API.
- `bookings.paymentMeta` is **not** field-locked on create. A guest POST can inject fake Stripe/MoMo reference ids.
- Booking `total`, snapshotted room prices, and experience prices are **trusted from the client**. The backend does not recalculate from live Rooms/Experiences. PaymentIntent/MoMo amount uses that untrusted `total`.
- Payment routes do not check that `booking.paymentMethod` matches Stripe vs MoMo. `findByID` 404 vs 200 enumerates valid booking ids.

---

## 5. Current API

There is **no** `/api/v1/` prefix. The public site talks to Payload REST as generated from slugs.

### Payload REST (via `backend/src/app/(payload)/api/[...slug]/route.js`)

Standard Payload REST for every collection/global, including:

| Method | Path | Used by frontend? |
|---|---|---|
| GET | `/api/globals/company?depth=2` | `useSiteLayout` |
| GET | `/api/globals/navigation?depth=2` | `useSiteLayout` |
| GET | `/api/globals/home-page?depth=2` | `useHomePage` |
| GET | `/api/globals/rooms-page?depth=2` | `useRoomsPage` |
| GET | `/api/globals/bar-restaurant-page?depth=2` | `useBarRestaurantPage` |
| GET | `/api/globals/gallery-page?depth=2` | `useGalleryPage` |
| GET | `/api/globals/about-page?depth=2` | `useAboutPage` |
| GET | `/api/globals/contact-page` | **not used** |
| GET | `/api/rooms?limit=100&depth=2` | home + rooms + room detail |
| GET | `/api/experiences?limit=100&depth=1` | booking experience picker |
| GET | `/api/gallery-photos?limit=100&depth=2` | gallery |
| POST | `/api/bookings` | booking submit (plain axios, not `apiClient`) |
| GET | `/api/media/file/{filename}` | image URLs via `mediaUrl()` |
| * | `/api/users`, `/api/graphql`, Payload auth routes | admin only / unused by public site |

GraphQL is a declared dependency; the frontend never calls it. If Payload GraphQL is enabled by default, it is an extra attack surface to confirm in Phase 3.

### Custom Next.js routes

| Method | Path | Purpose | Auth |
|---|---|---|---|
| OPTIONS/POST | `/api/payments/stripe/create-intent` | `{ bookingId }` → Stripe `clientSecret` | **none** |
| POST | `/api/payments/stripe/webhook` | Stripe signature verify; set `paymentStatus` | Stripe signature |
| OPTIONS/POST | `/api/payments/momo/request-to-pay` | `{ bookingId, phoneNumber }` → MoMo USSD | **none** |
| OPTIONS/GET | `/api/payments/momo/status` | poll MoMo; set `paymentStatus` | **none** |

CORS for custom payment routes is a hand-rolled helper (`FRONTEND_URL` or `http://localhost:5173`). Payload REST CORS/CSRF come from `payload.config.js`.

### Error / validation / logging

- No centralized error classes (`ValidationError`, etc.).
- No request validation library. Payload schema validation applies to collection POSTs. Payment routes check a couple of required fields only.
- No structured logger (no Pino/Winston). Failures `console`/`throw` or return JSON `{ error }`.
- Frontend `apiClient` toasts *every* Axios failure with “Could not reach the CMS — some content may be out of date,” which is why booking POST avoids it.

---

## 6. Current frontend

### Routes (`frontend/src/router/index.jsx`)

| Path | Page | Layout |
|---|---|---|
| `/` | Home | `Layout hasHero={true}` (transparent nav) |
| `/rooms` | Rooms list | offset nav |
| `/rooms/:roomId` | Room detail (`roomId` = CMS **slug**) | offset nav |
| `/bar-restaurant` | Bar & restaurant | offset nav |
| `/gallery` | Gallery | offset nav |
| `/about` | About | offset nav |
| `/contact` | Contact | offset nav |
| `/book` | 3-step booking | offset nav |
| `*` | Not found | no chrome |

There is **no** `/dashboard`, `/login`, `/admin` on the Vite app. Staff UI is Payload at `http://localhost:3000/admin`.

### Layout and state

- `Layout` **blocks the entire site** until `useSiteLayout` succeeds. CMS down → site-wide error, no static fallback.
- `CartProvider` (sessionStorage `gv-stay-cart`): rooms + experiences.
- `BookingProvider` (sessionStorage `gv-booking-stay`): dates, guest, payment/confirmation method, step. Scoped to `/book` only.
- React Query: one hook per page (`useHomePage`, `useRoomsPage`, …) with `staleTime` 5 minutes. Sections re-call the same hook and hit cache.
- No Redux/Zustand. No feature-folder architecture (`features/auth`, `features/hotel`).

### API communication

- Single Axios instance: `frontend/src/lib/apiClient.js` (`VITE_CMS_URL` or `http://localhost:3000`).
- Adapters: `adaptRoom`, `adaptExperience`, `mediaUrl` map Payload docs into pre-CMS component shapes.
- Booking write + payments use **raw axios** against `CMS_URL` (to avoid the misleading CMS toast).

### Pages vs CMS vs leftover static `@data`

| Page | CMS-driven? | Notes |
|---|---|---|
| Home | Mostly | `HomeStats` / `HeroStats` exist but are **not mounted**. CMS `home-page.stats` is unused. |
| Rooms / detail | Yes | Feature icons still from `FEATURE_LIBRARY` in `@data/rooms/rooms.js` |
| Bar & restaurant | Mostly | `BarRestaurantCTA` is hardcoded. Hero video uses `page.hero?.videoUrl.url` (will throw if upload is empty). |
| Gallery | Photos from CMS | Filter tabs from static `galleryCategories` (intentional mirror of select options) |
| About | Yes | |
| Contact | **No** | No `useContactPage`. Hero/info/form still import `@data/company` and `@data/contact/contact`. Room dropdown from static `rooms.js`. ContactPage global is unused. |
| Booking | Cart + CMS company/experiences/rooms | |

`frontend/src/data/` still contains a full static copy of the old brochure (including typo file `HomeRoomsss.js`). `frontend/public/images/` duplicates many assets that now live in `backend/storage/media/`.

### Booking flow (hotel-specific, implemented)

1. Add rooms from home / list / detail (cart).
2. `/book` step 1: dates, nights, room picker, experience picker.
3. Step 2: guest name + required mobile.
4. Step 3: pay-at-hotel / Stripe / MoMo / Western Union; WhatsApp or email receipt.
5. POST `/api/bookings`, then optionally payment, then EmailJS or `wa.me`.

Pricing: `pricePerNight * nights + experience.price`. Displayed as **USD `$`**. MoMo charges **RWF**. Stripe charges **USD cents**. These are not reconciled.

No availability calendar. Double-booking is possible.

### SEO / a11y / performance (public site)

- `index.html` title is `BE Inn Villa`. No per-page titles, no meta description, no Open Graph, no canonical, no sitemap, no robots, no JSON-LD.
- SPA (Vite): crawlers see an empty `#root` without a prerender/SSR story.
- Images: CMS Sharp sizes exist (400/900/1600) but the frontend often uses the original URL via `mediaUrl`.
- Lazy route splitting: yes. Lazy images: not systematically.
- Some `role="alert"` on page-level CMS failures. Contact/booking have honest “not configured” states.

### Tests

None (`*.test.*` / `*.spec.*` count = 0).

---

## 7. Existing hotel functionality

**Implemented (public brochure + booking request):**

- Marketing pages: Home, Rooms, Room detail, Bar & restaurant, Gallery, About, Contact (partially static).
- CMS-editable copy, nav, company details, rooms, experiences, gallery photos.
- Stay cart + multi-room + experiences.
- Booking request persisted in Mongo.
- Pay at hotel.
- Western Union (save booking, staff confirms later).
- Stripe PaymentIntent + webhook **code** (keys not required to boot; returns 501 if unset).
- MTN MoMo request-to-pay + poll **code** (same 501 pattern).
- WhatsApp deep-link receipt; EmailJS receipt if env set.
- Payload admin to confirm/cancel bookings and edit content.
- Local media library.

**Not implemented (called out in Ireme hotel module, but absent here):**

- Guests as a first-class entity / CRM
- Front office (check-in/out, room status)
- POS
- Stock / inventory
- Reports
- Room availability / overbooking prevention
- Articles/news
- Dedicated Facilities or Location pages (amenities live on Home; `mapUrl` on Company)
- Staff dashboard other than Payload admin
- In-app notifications, audit log, generic settings

This hotel project is a **marketing site + reservation intake**, not a property-management system.

---

## 8. Feature completion matrix

| Feature | Status | Working? | Incomplete? | Bug? | Needs refactoring? |
|---|---|---|---|---|---|
| Public home/rooms/about/gallery | Built | Yes, if CMS populated | Stats unused | | Dual data sources |
| Contact page | Partial | Form can send EmailJS | CMS global unused; static company/rooms | Stale room list | Wire to CMS |
| Bar & restaurant | Partial | Mostly | Hardcoded CTA | `videoUrl.url` possible crash if no video | |
| Cart + booking steps | Built | Pay-at-hotel path designed to work | Payments need keys | Currency USD vs RWF | Split hotel module |
| Stripe | Code only | 501 without keys | Unauthenticated intent create (IDOR) | Amount assumed USD | Auth + currency |
| MoMo | Code only | 501 without keys | Unauthenticated pay/status | Currency RWF vs `$` UI | Auth + currency |
| Western Union | Built | Booking saved | No receiver details in CMS | | Settings in hotel module |
| Payload admin | Built | Yes | No roles | | Keep as staff UI or wrap later |
| Users / roles / permissions | Missing | Payload user only | Entire Ireme spec | | Core feature |
| Settings / notifications / audit / files service | Missing | Media local only | Entire Ireme spec | Video thumbnail URL is `https://flaticon.com` | Core feature |
| Dashboard shell | Missing | Admin is Payload, not Ireme shell | | | Do not fake it on the public SPA |
| Tests / seed / CI / deploy | Missing | | | | Phase 3–8 |
| SEO | Missing | Title only | All of §24 | SPA vs SEO | Architecture decision |
| Env examples | Present | | Atlas URI not default | `frontend/.env` **tracked in git** (EmailJS keys) | Untrack secrets |
| Booking terms `/policy` | Broken | Link 404 | No policy page | Add page or CMS global |
| “Unlock 30% discount” | Placeholder | Copy only | Not wired | Remove or implement |
| Navbar brand | Partial | Footer uses CMS name | Navbar uses the BE Inn Villa wordmark | Use `company.name` |
| Dead `Hero.jsx` / `HeroStats.jsx` | Leftover | Not on any route | Duplicates HomeHero/HomeStats | Delete |

**Site does not render without a running CMS and populated globals** (Company + Navigation at minimum). Empty Atlas/local DB = error page, not a brochure fallback.

---

## 9. Technical debt

### Duplicated code / data

- `frontend/src/data/**` vs Payload globals/collections.
- `frontend/public/images/**` vs `backend/storage/media/**`.
- Feature lists duplicated (`Rooms.features` options vs `FEATURE_LIBRARY`).
- Gallery categories duplicated (collection select vs `galleryCategories`).
- Two Axios styles (`apiClient` vs raw axios).
- Payment CORS helper duplicates Payload CORS config.

### Inconsistent naming

- Repo folders: `frontend` / `backend`. Spec text still says `dev-frontend`.
- Env: `MONGODB_URI` is the database name in `.env`. `DATABASE_URI` remains a fallback.
- npm names: `beinnvilla-frontend` / `beinnvilla-backend`.
- `HomeRoomsss.js` typo.
- HTML title is `BE Inn Villa`.
- Booking `roomId` is a slug, not a Mongo id.

### Unnecessary / leftover

- Vite template README (replaced with a stub).
- Unused `HomeStats` / `HeroStats` on the live home page; unused `Hero.jsx` (duplicate carousel).
- `@utils` alias points at an empty `src/utils/`.
- `graphql` unused by our code (Payload may still expose `/api/graphql`).
- React type packages without TypeScript source.

### Poor separation of concerns

- Hotel collections (`rooms`, `bookings`, `experiences`) sit beside `users`/`media` with no `core/` vs `modules/hotel/`.
- Page globals are hotel-marketing, not reusable starter CMS.
- Payload admin **is** the back office — mixing CMS and future PMS.
- Controllers/services do not exist; business rules live in React hooks and collection hooks.

### Oversized / fragile frontend

- `Step3Confirm.jsx` owns four payment paths.
- `useBarRestaurantPage` assumes `hero.videoUrl.url` exists.
- Layout hard-fails the whole app on CMS errors.

### Database issues

- No indexes on booking dates, `paymentStatus`, Stripe/MoMo ids.
- No unique constraint to prevent double-booking.
- Totals stored as a number with no currency field.
- Public `bookings` create with no CAPTCHA/rate limit → spam collection.

### Security concerns (see §10)

---

## 10. Security issues (Phase 1 findings)

**High**

1. **`frontend/.env` is tracked in git** (EmailJS service/template/public key). Must stop tracking; rotate if the repo is or was public.
2. **Public unauthenticated `POST /api/bookings`** — spam, fake reservations, storage abuse. Field-level locks on `status`/`paymentStatus` are good but do not stop volume.
3. **Client-supplied `total` and line prices are trusted.** Stripe/MoMo charge that number. Recalculate server-side from live room/experience docs (or a signed quote).
4. **`paymentMeta` is writable on public create** — unlike `status`/`paymentStatus`. Guests can inject fake payment references.
5. **Payment endpoints have no caller auth** and do not check `paymentMethod`. Anyone with a booking id can create a Stripe PaymentIntent or trigger MoMo. `404` vs success enumerates ids. Local API updates bypass collection access.
6. **No rate limiting** on public POST/payment routes.

**Medium**

7. CORS/CSRF allowlist is env-driven; mis-set `FRONTEND_URL` in production would be bad. Dev fallbacks include localhost only (good). Custom payment routes are **not** covered by Payload CSRF (plain Next handlers). Payment CORS allows only `FRONTEND_URL`; Payload CORS also allows `:3000`.
8. GraphQL may be enabled with the same access rules — confirm and disable if unused (`/api/graphql`).
9. Media: public read of all files; `alt` not required; `mimeTypes` includes `image/*` (broad); videos allowed. No virus scan, no cloud ACL. Video admin thumbnail is the broken URL `https://flaticon.com`.
10. Error JSON from MoMo can include `err.message` (provider/network details).
11. Stripe webhook verifies signatures (good). MoMo status poll is the client’s word plus MTN API — bookingId in the query is not proven to match the stored `momoReferenceId`.
12. No `checkOut > checkIn` validation on the server. No `serverURL` in Payload config (absolute media/email URLs in production).

**Lower / hygiene**

13. No security headers (Helmet / Next headers) documented.
14. Secrets in `.env.example` are empty (good). Production still needs Atlas + Payload secret rotation.
15. XSS: React default escaping; rich text barely used. Uploaded SVG could be a concern if `image/*` allows `image/svg+xml`.
16. Email booking receipts can run with an empty guest email (field is optional; EmailJS still fires if confirmation method is email).

Passwords are **not** stored plaintext (Payload auth). That part is sound.

---

## 11. Environment configuration

**Backend** (`backend/.env.example`): `PAYLOAD_SECRET`, `DATABASE_URI`, `FRONTEND_URL`, Stripe, MoMo.

**Frontend** (`frontend/.env.example`): `VITE_CMS_URL`, EmailJS, `VITE_STRIPE_PUBLISHABLE_KEY`.

Not present: `MONGODB_URI`, S3/Spaces credentials, SMTP, DigitalOcean, log level, `NODE_ENV`-specific CORS list, seed flags.

Deployment: README mentions Node + nginx in prose only. No Dockerfile, no nginx conf, no process manager config, no GitHub Actions.

---

## 12. Classification of existing code (do not rewrite blindly)

| Area | Class | Rationale |
|---|---|---|
| Payload 3 + Mongo + admin | **A — Keep** | Working CMS; ripping it for Express would be a forbidden rewrite |
| Public Vite site structure, sections, CSS | **A — Keep** | Real design; fine-tune, don’t redesign |
| Booking cart + 3-step UI | **A / B** | Keep UX; extract hotel module; fix payments/currency/spam |
| Query hooks + adapters | **B — Small refactor** | Become `services/hotel/*` without changing Payload shapes yet |
| `frontend/src/data` + unused stats + `Hero.jsx` | **E — Delete** after contact is wired to CMS (keep `FEATURE_LIBRARY` / gallery category constants or move next to CMS enums) |
| `frontend/public/images` | **E — Delete** once CMS media is the only source (verify no leftover imports) |
| Stripe/MoMo routes | **C — Significant refactor** | Keep providers; add auth, currency field, rate limits |
| Users collection | **C** | Expand toward Ireme user spec **without** inventing a second auth system |
| Local `storage/media` | **B then C** | Keep for now; add FileService + Spaces/S3 when production images need it |
| Custom Ireme dashboard SPA | **Do not invent in Phase 1–2** | Payload admin already manages content/bookings. A second dashboard is new product, not a refactor |
| Express `controllers/` tree | **Do not force** | Fight Payload. Map “controller/service” onto Payload collections, hooks, and a thin `/api/v1` facade if needed |

---

## 13. Gap vs requested Ireme Starter

| Ireme Starter core | In this repo today |
|---|---|
| Auth, users, roles, permissions | Payload admin user only |
| Dashboard shell | Payload admin; no public `/dashboard` |
| Settings / notifications / audit logs | Absent |
| FileService (S3/Spaces) | Local disk `media` collection |
| `/api/v1` + Zod + error classes + Pino | Payload REST + ad hoc JSON |
| Tests + seed | Absent |
| TypeScript | Absent |
| Hotel module isolation | Hotel is the whole backend |
| Public vs admin split | Yes in practice (Vite vs `:3000/admin`), not in folder `features/` |
| POS/stock/front office/reports | Absent — **do not invent** for this hotel |

---

## 14. Critical constraint for later phases

This is **not** a blank Express app. It is Payload CMS + a Vite marketing site.

Adapting Ireme Starter **must use Payload conventions** (collections, globals, access control, hooks, Local API) for core entities, and keep hotel collections in a clearly named module. Replacing Payload with hand-rolled `app.ts` / `server.ts` MVC would discard the intern’s working CMS and violate “do not rewrite the entire application without approval.”

The public site being a **client-only SPA** is the main conflict with the SEO production requirement. That is a Phase 2 decision (prerender, or Next.js public app, or live with SPA SEO limits). It must not be silently rewritten in Phase 3.

---

## 15. Phase 1 stop

Findings are recorded. **No major architecture migration has been started.**

Recommended next step (Phase 2, after approval):

1. Keep Payload + MongoDB Atlas (`MONGODB_URI` alias of `DATABASE_URI`).
2. Keep the Vite public site for now; plan SEO separately.
3. Introduce `backend/src/core/` vs `backend/src/modules/hotel/` as a **folder move of existing collections**, not a new framework.
4. Do **not** build POS/stock/front office unless BE Inn Villa actually needs them.
5. Fix high-risk items first: untrack `.env`, booking spam controls, **recalculate totals server-side**, lock `paymentMeta` on create, payment IDOR, contact CMS wiring, remove fake 30% copy and `/policy` 404.

Await review before Phase 2.
