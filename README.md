# Lions Club Ahmedabad â€” Mobile App

Monorepo. Three pieces:

| Folder    | What                                                |
|-----------|-----------------------------------------------------|
| `app/`    | Expo React Native app (TypeScript)                  |
| `server/` | Express + mysql2 + JWT REST API (TypeScript)        |
| `db/`     | MySQL schema + seed SQL (auto-loaded by Docker)     |
| `docs/`   | Deploy + ops notes                                  |

Design prototypes live at the root (`screens/*.jsx`, `Design Tokens _ RN-ready.html`, `Components _ API contracts.html`, `Lions Club App Design.html`). Tokens are mirrored exactly in `app/src/theme/tokens.ts`.

## Stack

- **App:** Expo 51 (TS) Â· React Navigation 6 Â· Zustand Â· TanStack Query Â· Expo Notifications Â· SecureStore
- **API:** Node 18+ Â· Express 4 Â· mysql2 (promise pool) Â· JWT (access + refresh) Â· Zod Â· helmet Â· rate-limit Â· expo-server-sdk
- **DB:** MySQL 8 (utf8mb4) â€” local via Docker Desktop
- **Auth:** Phone OTP (dev: logged; prod: SMS gateway TBD â€” MSG91/Twilio)
- **RBAC:** `roles.can_edit_club_data` â€” only President / Secretary / Treasurer can write. Others read-only.

## First run (full dev loop)

```
# 1. DB
cp .env.example .env
docker compose up -d                 # MySQL on :3306, Adminer on :8080

# 2. API
cd server
cp .env.example .env
npm install
npm run dev                          # :4000

# 3. App
cd ../app
npm install
# Edit app.json â†’ expo.extra.apiBaseUrl to http://<your-LAN-IP>:4000
npm start                            # scan QR with Expo Go
```

The DB schema + mock seed load automatically on first container start (mounted into `docker-entrypoint-initdb.d`). To wipe and re-seed:

```
docker compose down -v && docker compose up -d
```

## Importing the real club directory

```
cd server
npm run import:pdf -- --file "../New Club Directory.pdf" --dry-run
# Inspect import-preview.json + import-skipped.json
npm run import:pdf -- --file "../New Club Directory.pdf"
```

The parser is heuristic â€” manually fix skipped rows in Adminer, or extend `src/scripts/import-pdf-directory.ts`.

## Production deploy

API â†’ cPanel (Phusion Passenger): see [`docs/DEPLOY-CPANEL.md`](docs/DEPLOY-CPANEL.md).
App â†’ Expo EAS Build (set `expo.extra.apiBaseUrl` first).

## Phase 1 scope âœ“

- [x] All screens from `screens/*.jsx` ported to RN
- [x] Phone OTP auth + JWT (access + refresh in SecureStore)
- [x] Roster (search + detail)
- [x] Events (list + detail + RSVP yes/no/maybe)
- [x] News (list + detail)
- [x] Profile + Profile Edit
- [x] Officer Admin (create event / publish news) â€” gated by RBAC
- [x] Service / Causes impact dashboard
- [x] Info / About
- [x] Push notifications (Expo) â€” fan-out on new event + news
- [x] PDF directory import script
- [x] MySQL via Docker
- [x] cPanel deploy guide

## Phase 2 (later)

- Real SMS gateway (MSG91 / Twilio)
- [x] Photo uploads (server disk direct upload from app; S3 later) — needs `npx expo install expo-image-picker`
- [x] Service-project logging UI for officers (Log project form on Service Impact)
- [x] Notifications inbox UI
- Multi-club / district view
- iOS / Android EAS Build profiles
