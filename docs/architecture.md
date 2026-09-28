# Target architecture (Ireme Starter + BE Inn Villa)

BE Inn Villa is the Ireme implementation in this repo. Payload CMS stays the backend. Hotel code is isolated from core.

```text
IREME CORE (backend/src/core)
  users, files (media), settings (company, navigation), security (CORS, rate limit)

PUBLIC WEBSITE (frontend)
  pages + sections
  features/hotel — queries, cart, booking

HOTEL MODULE (backend/src/modules/hotel)
  rooms, experiences, reservations, gallery, marketing pages, payments
```

Not implemented for this property (do not invent): POS, stock, front office, reports, a second `/dashboard` SPA.

See `docs/current-architecture.md` for the Phase 1 audit of what existed before this split.
