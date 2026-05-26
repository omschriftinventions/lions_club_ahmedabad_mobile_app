# Lions Club API

Express + TypeScript + mysql2. JWT (access + refresh). Phone OTP auth. Expo push.

## Setup

```
cd server
cp .env.example .env
npm install
npm run dev      # tsx watch on :4000
```

DB must be running first (see root `docker-compose.yml`).

## Routes

| Method | Path                       | Auth | Role        | Purpose                          |
|--------|----------------------------|------|-------------|----------------------------------|
| GET    | /health                    | —    | —           | Liveness + DB ping               |
| POST   | /auth/otp/request          | —    | —           | Send OTP to phone                |
| POST   | /auth/otp/verify           | —    | —           | Exchange OTP for tokens          |
| POST   | /auth/refresh              | —    | —           | Rotate access token              |
| POST   | /auth/logout               | —    | —           | Revoke refresh session           |
| GET    | /members                   | Y    | any         | List members (search, role)      |
| GET    | /members/me                | Y    | any         | Self profile                     |
| GET    | /members/:id               | Y    | any         | Member detail                    |
| POST   | /members                   | Y    | editor      | Add member                       |
| PATCH  | /members/:id               | Y    | self/editor | Edit (self or editor for others) |
| DELETE | /members/:id               | Y    | editor      | Soft-delete                      |
| GET    | /events                    | Y    | any         | List events                      |
| GET    | /events/:id                | Y    | any         | Event + attendees                |
| POST   | /events                    | Y    | editor      | Create                           |
| PATCH  | /events/:id                | Y    | editor      | Edit                             |
| DELETE | /events/:id                | Y    | editor      | Cancel                           |
| PUT    | /events/:id/rsvp           | Y    | any         | RSVP (yes/no/maybe)              |
| GET    | /news                      | Y    | any         | List news                        |
| GET    | /news/:id                  | Y    | any         | Detail                           |
| POST   | /news                      | Y    | editor      | Publish                          |
| PATCH  | /news/:id                  | Y    | editor      | Edit                             |
| DELETE | /news/:id                  | Y    | editor      | Delete                           |
| GET    | /causes                    | Y    | any         | LCI causes list                  |
| GET    | /causes/impact             | Y    | any         | Aggregate impact                 |
| GET    | /service-projects          | Y    | any         | List projects                    |
| POST   | /service-projects          | Y    | editor      | Log impact entry                 |
| GET    | /notifications             | Y    | any         | Inbox                            |
| POST   | /notifications/read        | Y    | any         | Mark read                        |
| POST   | /push/register             | Y    | any         | Register Expo token              |
| POST   | /push/unregister           | Y    | any         | Deactivate token                 |

"editor" = role with `roles.can_edit_club_data = 1` (President, Secretary, Treasurer).

## Build for production

```
npm run build      # outputs dist/
npm start          # node dist/index.js
```

Or for cPanel/Passenger: point app to `app.js` after running `npm run build`.

## Dev OTP

When `OTP_DEV_LOG=true` (default in `.env.example`), OTP codes are printed to server logs instead of sent via SMS. Replace with MSG91/Twilio in `src/utils/sms.ts` later.
