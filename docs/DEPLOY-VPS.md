# Deploying the API + Web app to an Ubuntu VPS

Production deployment runbook for **lionsclubofahmedabadhost.com** on a fresh Ubuntu 20.04/22.04/24.04 VPS.

**Architecture:**
```
DNS (GoDaddy)
  api.lionsclubofahmedabadhost.com  -> 5.189.172.74  -> Nginx (TLS) -> Node API (:4000, PM2)
  lionsclubofahmedabadhost.com      -> 5.189.172.74  -> Nginx (TLS) -> static web/dist
  www.lionsclubofahmedabadhost.com  -> 5.189.172.74  -> Nginx (TLS) -> static web/dist
MySQL 8 (localhost) <- API
```

**Stack:** Node 20 + Express (PM2) · MySQL 8 · Nginx · Let's Encrypt (certbot) · the WhatsApp Baileys bot runs inside the API process under PM2.

---

## 0. Prerequisites

- An Ubuntu VPS with root/sudo SSH access.
- The domain `lionsclubofahmedabadhost.com` registered (GoDaddy).
- Your repo available (GitHub/GitLab or uploaded via `scp`).
- Local: the real members are in your local Docker MySQL (for the members dump in step 6).

Replace `5.189.172.74` and the passwords below with your real values.

---

## 1. DNS at GoDaddy (do this first)

In GoDaddy DNS for `lionsclubofahmedabadhost.com`, add A records pointing to `5.189.172.74`:

| Type | Name | Value |
|------|------|-------|
| A | `api` | `5.189.172.74` |
| A | `@` | `5.189.172.74` |
| A | `www` | `5.189.172.74` |

Propagation usually takes a few minutes. Verify before the SSL step:
```bash
dig +short api.lionsclubofahmedabadhost.com    # should return 5.189.172.74
```

---

## 2. Install the stack on the VPS

SSH in, then:

```bash
# Node.js 20 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL 8, Nginx, git, certbot, build tools
sudo apt install -y mysql-server nginx git build-essential
sudo npm install -g pm2
sudo apt install -y certbot python3-certbot-nginx

# Secure MySQL (set root password, remove test DB, answer Y to the rest)
sudo mysql_secure_installation
```

---

## 3. Create the database + user

```bash
sudo mysql -e "CREATE DATABASE lionsclub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; \
CREATE USER 'lions'@'localhost' IDENTIFIED BY 'STRONG_DB_PASSWORD'; \
GRANT ALL ON lionsclub.* TO 'lions'@'localhost'; FLUSH PRIVILEGES;"
```

Remember `STRONG_DB_PASSWORD` — it goes in the API `.env`.

---

## 4. Get the code on the VPS

```bash
sudo mkdir -p /var/www/lionsclub
sudo chown $USER:$USER /var/www/lionsclub
cd /var/www/lionsclub
git clone <your-repo-url> .
```

If the repo is private, use a deploy key. Alternatively, from your PC:
```powershell
scp -r C:\Omschrift\Projects\Omschrift\LionsClubMobileApp\server <user>@5.189.172.74:/var/www/lionsclub/
scp -r C:\Omschrift\Projects\Omschrift\LionsClubMobileApp\web <user>@5.189.172.74:/var/www/lionsclub/
scp -r C:\Omschrift\Projects\Omschrift\LionsClubMobileApp\db <user>@5.189.172.74:/var/www/lionsclub/
```

> **Note:** `.env` files are gitignored and will NOT be cloned. You create them in steps 5 and 7.

---

## 5. Build + run the API

```bash
cd /var/www/lionsclub/server
npm install
npm run build          # produces dist/index.js (app.js loads it)
mkdir -p /var/www/lionsclub/uploads/photos
```

Create `/var/www/lionsclub/server/.env`:

```ini
NODE_ENV=production
PORT=4000

DB_HOST=localhost
DB_PORT=3306
DB_USER=lions
DB_PASSWORD=STRONG_DB_PASSWORD
DB_NAME=lionsclub

# Generate two different random secrets:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=<random 64-byte hex>
JWT_REFRESH_SECRET=<another random 64-byte hex>

OTP_DEV_LOG=false
DEV_BYPASS_OTP=false

# Expo push (from expo.dev -> your project -> Access Tokens)
EXPO_ACCESS_TOKEN=<your token>

# Web origins that may call the API
CORS_ORIGINS=https://lionsclubofahmedabadhost.com,https://www.lionsclubofahmedabadhost.com

# Super admin fixed password (re-applied on every server boot)
SUPER_ADMIN_PASSWORD=<a strong unique password>

# Photo uploads (persistent dir outside the code tree)
UPLOADS_DIR=/var/www/lionsclub/uploads/photos
PUBLIC_BASE_URL=https://api.lionsclubofahmedabadhost.com

# MSG91 SMS (set when your DLT approvals land)
# SMS_PROVIDER=msg91
# SMS_API_KEY=<Auth Key>
# SMS_SENDER_ID=LIONSC
# MSG91_DLT_ENTITY_ID=<Entity ID>
# MSG91_OTP_TEMPLATE_ID=<Template ID>
# MSG91_OTP_FLOW_ID=<Flow ID>
# MSG91_OTP_VAR_NAME=otp
```

Start with PM2:
```bash
pm2 start dist/index.js --name lions-api
pm2 startup        # copy/paste the one command it prints
pm2 save
```

On boot, the server auto-creates the `app_settings` table, the `password_hash` column, and fixes the super-admin password to `SUPER_ADMIN_PASSWORD`.

Verify:
```bash
curl http://127.0.0.1:4000/health   # {"ok":true,"env":"production"}
pm2 logs lions-api --lines 20       # check for errors
```

---

## 6. Import the database

### 6a. Schema + migrations (on the VPS)

```bash
cd /var/www/lionsclub
mysql -ulions -p lionsclub < db/schema.sql
mysql -ulions -p lionsclub < db/migrations/002_phase2.sql
mysql -ulions -p lionsclub < db/migrations/003_egains.sql
mysql -ulions -p lionsclub < db/migrations/004_settings.sql
mysql -ulions -p lionsclub < db/migrations/005_auth_password.sql
```

### 6b. Members (dump from your local Docker MySQL, import on the VPS)

On your PC (Windows, Docker MySQL running):
```powershell
docker exec lionsclub_mysql mysqldump -ulions -plionspass lionsclub members `
  --where="name NOT LIKE 'Lion %'" --no-create-info --complete-insert > members.sql
```
This exports the 105 real members + the super admin (Shivam), excluding the mock seed.

Upload to the VPS:
```powershell
scp members.sql <user>@5.189.172.74:/tmp/
```

On the VPS:
```bash
mysql -ulions -p lionsclub < /tmp/members.sql
```

The super-admin row arrives with `is_super_admin=1`; the server sets its password from `SUPER_ADMIN_PASSWORD` on boot.

### 6c. Set officer passwords (after first login)

Log in as super admin (phone `8905496456` + `SUPER_ADMIN_PASSWORD`), open **Manage Roster** (web) or **Manage members** (mobile), and set passwords for the real President/Secretary/Treasurer. They can then log in via password.

---

## 7. Build the web app on the VPS

```bash
cd /var/www/lionsclub/web
npm install
npm run build      # uses web/.env.production -> API = https://api.lionsclubofahmedabadhost.com
                    # output: web/dist/
```

If `web/.env.production` is missing (gitignored), create it:
```bash
echo 'VITE_API_URL=https://api.lionsclubofahmedabadhost.com' > web/.env.production
npm run build
```

---

## 8. Nginx configuration

### API server block

Create `/etc/nginx/sites-available/lions-api`:
```nginx
server {
    listen 80;
    server_name api.lionsclubofahmedabadhost.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 12m;   # allow photo uploads (base64)
}
```

### Web server block

Create `/etc/nginx/sites-available/lions-web`:
```nginx
server {
    listen 80;
    server_name lionsclubofahmedabadhost.com www.lionsclubofahmedabadhost.com;

    root /var/www/lionsclub/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback
    }
}
```

### Enable + reload

```bash
sudo ln -s /etc/nginx/sites-available/lions-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/lions-web /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Verify (before SSL, HTTP only):
```bash
curl http://api.lionsclubofahmedabadhost.com/health    # {"ok":true,"env":"production"}
curl -I http://lionsclubofahmedabadhost.com            # 200 OK
```

---

## 9. Firewall + SSL

### UFW

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Let's Encrypt (free, auto-renews)

```bash
sudo certbot --nginx -d api.lionsclubofahmedabadhost.com \
  -d lionsclubofahmedabadhost.com -d www.lionsclubofahmedabadhost.com
```

Certbot obtains the certs, rewrites Nginx for HTTPS, and adds an auto-redirect. Verify:
```bash
curl https://api.lionsclubofahmedabadhost.com/health    # {"ok":true,"env":"production"}
```

Open `https://lionsclubofahmedabadhost.com` in a browser — you should see the login screen.

---

## 10. Post-deploy checklist

- [ ] `curl https://api.lionsclubofahmedabadhost.com/health` returns `{"ok":true,"env":"production"}`
- [ ] `https://lionsclubofahmedabadhost.com` loads the web login
- [ ] Log in as super admin (8905496456 + `SUPER_ADMIN_PASSWORD`) — dashboard loads
- [ ] Roster shows real members (not mock seed)
- [ ] System Admin page: verify `auth_method = password` (default)
- [ ] Manage Roster: set passwords for real officers
- [ ] Upload a photo from the web gallery — appears in `/uploads/photos`
- [ ] `DEV_BYPASS_OTP=false` and `OTP_DEV_LOG=false` in `server/.env`
- [ ] JWT secrets are random (not `change-me-*`)
- [ ] `SUPER_ADMIN_PASSWORD` is a strong unique value (not `Omsinv@8786`)
- [ ] `pm2 save` ran (API auto-starts on reboot)
- [ ] Certbot auto-renew: `sudo certbot renew --dry-run`

### Optional: switch auth method

From the System Admin page (super admin):
- **Password** (default) — best for App Store / Play Store review.
- **SMS (MSG91)** — set `MSG91_*` env vars, then toggle to SMS.
- **WhatsApp OTP** — toggle to WhatsApp, scan the QR on the System Admin page. The Baileys bot runs inside the API process under PM2 (always-on, unlike cPanel).

### Mobile app (EAS Build)

`app/app.json` already has `apiBaseUrl = https://api.lionsclubofahmedabadhost.com`. Build:
```powershell
cd app
eas build --platform android --profile production
eas build --platform ios --profile production
```

For Apple review, give them: phone `8905496456` + `SUPER_ADMIN_PASSWORD` (or a demo member you create with a known password from Manage Roster).

---

## 11. Operations

### Update the API after a code change

```bash
cd /var/www/lionsclub/server
git pull
npm install        # if deps changed
npm run build
pm2 restart lions-api
```

### Update the web app

```bash
cd /var/www/lionsclub/web
git pull
npm install        # if deps changed
npm run build      # Nginx serves web/dist immediately, no reload needed
```

### View logs

```bash
pm2 logs lions-api --lines 50
pm2 logs lions-api --err --lines 20
```

### Restart / status

```bash
pm2 status
pm2 restart lions-api
```

### MySQL

```bash
mysql -ulions -p lionsclub
SHOW TABLES;
SELECT COUNT(*) FROM members;
```

### SSL renew (automatic, but verify)

```bash
sudo certbot renew --dry-run
```

---

## 12. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `curl /health` → connection refused | `pm2 status` — is `lions-api` running? `pm2 restart lions-api` |
| `curl /health` → 503 | DB not reachable. Check `DB_*` in `.env`, `mysql -ulions -p lionsclub` works |
| Web app blank / 404 | `web/dist` exists? `npm run build` in `web/`. Nginx root correct? `sudo nginx -t` |
| Certbot fails | DNS not propagated yet. `dig +short api.lionsclubofahmedabadhost.com` must return `5.189.172.74` |
| CORS error in browser | `CORS_ORIGINS` in `.env` includes `https://lionsclubofahmedabadhost.com`? Restart API |
| Photo upload 413 | Nginx `client_max_body_size 12m` present? `sudo nginx -t && sudo systemctl reload nginx` |
| WhatsApp won't link | `pm2 logs lions-api` — check `[wa]` errors. Run `npm install` in `server/` (Baileys + qrcode) |
| Mobile can't connect | `app.json` `apiBaseUrl` = `https://api.lionsclubofahmedabadhost.com`? Rebuild via EAS |
| Super admin can't login | `SUPER_ADMIN_PASSWORD` in `.env` is the password. Restart API so boot re-sets it |

---

## 13. Local development (unchanged)

- **Web dev:** `cd web && npm install && npm run dev` → `http://localhost:5173` (uses `web/.env` → `localhost:4000`).
  - If local web shows "server down", you may have a stale global `VITE_API_URL` env var. Unset it:
    ```powershell
    [Environment]::SetEnvironmentVariable('VITE_API_URL', $null, 'User')
    ```
    Then restart Vite.
- **Mobile dev:** `cd app && npx expo start` → scan QR with Expo Go (set `app.json` `apiBaseUrl` to your LAN IP or `localhost`).
- **Server dev:** `cd server && npm run dev` → `localhost:4000` (uses `server/.env`).
- **DB dev:** `docker compose up -d` → MySQL on `localhost:3306`.