# Lions Club App — Production-Readiness Checklist

Work through this top-to-bottom before going live. Tick each box. Items marked **DEV-ONLY** must be off in production.

> Snapshot 2026-06-26: code feature-complete; mobile app compiles clean; web app code-ready (deps install + export pending). Remaining work is credentials, deploy, and config.

---

## 1. Secrets & credentials

- [ ] Rotate **JWT_ACCESS_SECRET** and **JWT_REFRESH_SECRET** in `server/.env` to two different random 64-byte hex strings. Currently `change-me-*` placeholders.
  ```powershell
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] **EXPO_ACCESS_TOKEN** set in `server/.env` — DONE.
- [ ] No secrets committed: `server/.env` and `app/.env` are git-ignored (`.gitignore` has `.env`). Never upload `.env` to the host — set values via the cPanel env-var UI.

## 2. SMS gateway (MSG91) — gates real login

Until SMS is live, **DEV_BYPASS_OTP must stay true** (any 6-digit code logs in). Flip to false only after MSG91 is wired and tested.

- [ ] MSG91 DLT setup complete: Entity ID, Sender ID (e.g. `LIONSC`), approved OTP template + Template ID.
- [ ] MSG91 Flow created for the OTP template; note **Flow ID** and the **variable name** (e.g. `otp`).
- [ ] Copy **Auth Key** from MSG91 API settings.
- [ ] Set in `server/.env`:
  ```
  SMS_PROVIDER=msg91
  SMS_API_KEY=<Auth Key>
  SMS_SENDER_ID=LIONSC
  MSG91_DLT_ENTITY_ID=<Entity ID>
  MSG91_OTP_TEMPLATE_ID=<Template ID>
  MSG91_OTP_FLOW_ID=<Flow ID>
  MSG91_OTP_VAR_NAME=otp
  ```
- [ ] **DEV_BYPASS_OTP=false** (after the above + a successful live OTP test).
- [ ] OTP_DEV_LOG=false in production.
- [ ] Live test: a real member phone receives the OTP and login succeeds with the real code.

## 3. Push notifications

- [ ] **iOS — APNs**: created Apple APNs key (`.p8`), noted **Key ID** + **Team ID**; App ID `com.lionsclub.ahmedabad` registered with **Push Notifications** capability; `.p8` + Key ID + Team ID uploaded to Expo (project → Credentials → iOS → Push).
- [ ] **Android — FCM**: Firebase project + Android app (package `com.lionsclub.ahmedabad`); service-account JSON generated; uploaded to Expo (Credentials → Android → Push).
- [ ] Verified a test push arrives on a real device (not a simulator) after login registers the token.

## 4. API deployment — cPanel (GoDaddy) / Phusion Passenger

Prereq: cPanel plan includes "Setup Node.js App" (Passenger). Node 18+.

- [ ] Created subdomain `api.lionsclubahmedabad.org` (AutoSSL = HTTPS).
- [ ] Uploaded `server/` (no `node_modules`, no `.env`) to host, e.g. `~/lionsclub-server/`.
- [ ] In cPanel Terminal:
  ```
  cd ~/lionsclub-server
  npm install
  npm run build        # produces dist/index.js (app.js loads it)
  ```
- [ ] Created Node.js App: Node 18+/20+, mode Production, root = `lionsclub-server`, URL = `api.lionsclubahmedabad.org`, startup = `app.js`.
- [ ] Added environment variables (in the Node app UI):
  ```
  NODE_ENV=production
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=omsinv
  DB_PASSWORD=<same that works now>
  DB_NAME=lions_club_ahmedabad
  JWT_ACCESS_SECRET=<random>
  JWT_REFRESH_SECRET=<random>
  OTP_DEV_LOG=false
  DEV_BYPASS_OTP=true        # only until SMS live, then false
  EXPO_ACCESS_TOKEN=<token>
  CORS_ORIGINS=https://app.lionsclubahmedabad.org
  UPLOADS_DIR=/home/<cpaneluser>/lions_uploads/photos
  PUBLIC_BASE_URL=https://api.lionsclubahmedabad.org
  ```
- [ ] Created persistent uploads dir: `mkdir -p ~/lions_uploads/photos` (outside app root so redeploy keeps photos).
- [ ] Restarted the Node app.
- [ ] `curl https://api.lionsclubahmedabad.org/health` returns `{"ok":true,"env":"production"}`.
- [ ] DB connection works from localhost (if not: cPanel → MySQL Databases → re-add user `omsinv` to `lions_club_ahmedabad` with ALL PRIVILEGES).

## 5. Mobile app builds (EAS)

- [ ] `app/app.json` → `extra.apiBaseUrl` = `https://api.lionsclubahmedabad.org` (replace the ephemeral ngrok URL).
- [ ] `cd app && npx expo install expo-image-picker` — DONE (photo uploads).
- [ ] iOS build: `eas build --platform ios --profile preview` → install → enable device **Developer Mode** (Settings → Privacy & Security) → launch.
- [ ] Android build: `eas build --platform android --profile preview` → install APK.
- [ ] Store release: `eas build --platform android --profile production` (app-bundle) and `eas build --platform ios --profile production`; set up `eas submit`.

## 6. Web app build & deploy (same app in a browser)

Code is ready: platform storage (`storage.web.ts`), web no-op push (`push.web.ts`), SPA `.htaccess`, `web:export` script.

- [ ] `app/app.json` → `extra.apiBaseUrl` = `https://api.lionsclubahmedabad.org`.
- [ ] Install web toolchain (needs network):
  ```powershell
  cd app
  npx expo install react-dom react-native-web @expo/metro-runtime
  npm run web:export        # static site -> app/dist/
  ```
- [ ] cPanel → Subdomains → create `app.lionsclubahmedabad.org`.
- [ ] Upload **contents of `app/dist/`** (incl. `.htaccess`) into that subdomain's document root.
- [ ] Visit `https://app.lionsclubahmedabad.org` → loads, can log in, calls the API cross-origin.
- [ ] If a web route 404s on refresh, confirm `.htaccess` is present (SPA fallback) and Apache mod_rewrite is on.

## 7. Database & data

- [ ] `db/schema.sql` applied to `lions_club_ahmedabad`.
- [ ] `db/migrations/002_phase2.sql` applied (photos, chat, meeting minutes, awards, referrals, FAQs, service_projects, etc.).
- [ ] Real members seeded/imported (PDF/CSV import or manual) with correct **phone_e164** so OTP login resolves a member.
- [ ] Roles + `can_edit_club_data` flags set for President/Secretary/Treasurer.
- [ ] Backed up the DB before going live.

## 8. Config hardening (production only)

- [ ] `NODE_ENV=production`.
- [ ] `CORS_ORIGINS` = the real web/app origins (not localhost).
- [ ] `DEV_BYPASS_OTP=false` and `OTP_DEV_LOG=false`.
- [ ] JWT secrets are random (not `change-me`).
- [ ] HTTPS everywhere (AutoSSL on api + app subdomains). Required for prod push and web.
- [ ] Rate limits reviewed: OTP route is 5/min (adequate); monitor public endpoints for abuse.

## 9. Testing & QA (end-to-end on real devices)

- [ ] Login with a real phone + real SMS OTP.
- [ ] Push delivered on Android and iOS when an officer creates an event / publishes news / broadcasts.
- [ ] Roster search + member detail.
- [ ] Events list + detail + RSVP.
- [ ] News list + detail.
- [ ] Officer creates event / news / logs a service project / adds a photo (Library + Camera) / broadcasts.
- [ ] Photo upload appears in gallery and on the project detail.
- [ ] Chats, meeting minutes, awards wall, referrals, FAQs, district news all render.
- [ ] Web app: same flows in a browser; notifications inbox works (push not expected on web).
- [ ] `/health` returns `{"ok":true,"env":"production"}` after final restart.

---

## Quick command reference

```powershell
# Generate a JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Build the server (on host)
cd server && npm install && npm run build

# Mobile builds
cd app && eas build --platform android --profile preview
cd app && eas build --platform ios --profile preview

# Web build
cd app && npx expo install react-dom react-native-web @expo/metro-runtime
cd app && npm run web:export

# Health check
curl https://api.lionsclubahmedabad.org/health
```

## Known deferred / out of scope

- **Multi-club / district view** — dropped (single-club release).
- **Photo storage to S3** — current impl uses server disk (cPanel `UPLOADS_DIR`); S3 is a later swap behind the same route.
- **Web Push** — not implemented on web (web uses the in-app Notifications inbox). Add Web Push + service worker later if needed.