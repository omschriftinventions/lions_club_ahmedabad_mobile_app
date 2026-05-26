# Deploying the API to cPanel

cPanel hosts (e.g. Hostinger Business, Bluehost, A2, Namecheap) typically expose Node.js via **Phusion Passenger** under the "Setup Node.js App" tool. The API ships an `app.js` entry that Passenger will boot.

## 0. Prereqs on the host

- cPanel with **Setup Node.js App** (Passenger)
- A **MySQL Database** (cPanel → MySQL Databases): create DB + user, grant ALL.
- Outbound HTTPS allowed (needed by Expo push API).
- Node 18+ available. Lower versions break mysql2 + Expo SDK.

## 1. Create the MySQL DB

cPanel → MySQL® Databases:
1. New database — e.g. `cpaneluser_lionsclub`.
2. New user — e.g. `cpaneluser_lions` with a strong password.
3. Add user to database → check **ALL PRIVILEGES**.
4. Note the host. On most cPanel setups it's `localhost`.
5. Import `db/schema.sql` then `db/seed.sql` via phpMyAdmin.

## 2. Upload the server code

Two options:

**Git deploy (recommended).** cPanel → Git Version Control → Create. Point at your repo. Pull lands under `~/repositories/<name>`. Set the Node app's Application root to `server/`.

**Manual upload.** Zip `server/` (no `node_modules`, no `.env`). Upload via File Manager → Extract.

## 3. Build TypeScript

In cPanel terminal (or via Setup Node.js App → "Run NPM Install" then a script):

```
cd ~/path-to/server
npm install --omit=dev=false   # need devDeps for tsc
npm run build                  # outputs dist/
```

`app.js` (already in repo) just does `require('./dist/index.js')`.

## 4. Setup Node.js App

cPanel → **Setup Node.js App** → Create Application:

| Field                  | Value                                  |
|------------------------|----------------------------------------|
| Node.js version        | 18.x or newer                          |
| Application mode       | Production                             |
| Application root       | `server` (relative to home)            |
| Application URL        | e.g. `api.lionsclubahmedabad.org`      |
| Application startup    | `app.js`                               |
| Passenger log file     | default                                |

Add **environment variables** in the same UI:

```
NODE_ENV=production
PORT=                              # leave blank — Passenger sets it
DB_HOST=localhost
DB_PORT=3306
DB_USER=cpaneluser_lions
DB_PASSWORD=<strong-password>
DB_NAME=cpaneluser_lionsclub
JWT_ACCESS_SECRET=<random-64-bytes>
JWT_REFRESH_SECRET=<random-64-bytes>
OTP_DEV_LOG=false
EXPO_ACCESS_TOKEN=                  # set when you have one
CORS_ORIGINS=https://app.lionsclubahmedabad.org
```

Click **Save**, then **Restart**.

## 5. Test

```
curl https://api.lionsclubahmedabad.org/health
# → {"ok":true,"env":"production"}
```

## 6. Update the Expo app

`app/app.json`:
```json
"extra": { "apiBaseUrl": "https://api.lionsclubahmedabad.org" }
```
Then `eas build` (or `expo start --dev-client`).

## Caveats / gotchas

- **No long-lived sockets.** Passenger restarts workers; don't keep in-memory state. (Current code is stateless — fine.)
- **Outbound rate limits.** Some shared hosts throttle outbound; Expo push fan-out for large clubs may need batching tuning.
- **No native deps.** Everything in `package.json` is pure JS — `bcryptjs` (not `bcrypt`), `mysql2`, etc. Don't swap them.
- **SMS gateway.** OTPs only flow over SMS when `SMS_PROVIDER` is set + integrated. Until then, log-only (`OTP_DEV_LOG=true`) — toggle ONLY in dev.
- **TLS.** Use cPanel AutoSSL on the API subdomain. Expo push requires HTTPS in production builds.
- **Passenger startup file** must be `app.js` (or whatever you point it at); it is NOT the same as `package.json` "main".

## Rotating secrets

```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Paste output as `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`. Rotate once a year; existing refresh tokens will all be invalidated, forcing re-login (expected).
