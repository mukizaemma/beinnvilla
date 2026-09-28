# BE Inn Villa

Public hotel website + Payload CMS in one repository. Hotel-specific code lives under `modules/hotel` / `features/hotel`. Reusable platform pieces live under `backend/src/core`.

| Folder | Role |
|---|---|
| `frontend/` | Guest website (Vite + React) |
| `backend/` | CMS, admin, bookings API |
| `backend/src/core/` | Users, files, site settings, CORS |
| `backend/src/modules/hotel/` | Rooms, reservations, experiences, gallery, pages |
| `frontend/src/features/hotel/` | Queries, cart, booking, adapters |
| `backend/storage/media/` | Uploads |

## Run locally

You need **Node 20 or 22** and **MongoDB Atlas** (or local Mongo). Apache/MySQL from XAMPP are not used.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Set PAYLOAD_SECRET and MONGODB_URI in backend/.env
# The database name in that URI is beinnvilla

cd backend && npm install && npm run dev   # http://localhost:3000/admin
cd frontend && npm install && npm run dev  # http://localhost:5173
```

From the repo root: `npm run dev:backend` and `npm run dev:frontend`.

Create the first admin user at `/admin`, then fill Company, Navigation, and Rooms. The public site loads from the CMS.

## What is not in this hotel yet

POS, stock, front office, and reports are not part of BE Inn Villa. Do not add them unless the property needs them. Staff manage content and bookings in Payload admin (`/admin`), not a second dashboard.
