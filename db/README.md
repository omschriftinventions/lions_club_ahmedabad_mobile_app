# Database

MySQL 8.0. Schema lives in `schema.sql`. Initial mock data in `seed.sql`. Real directory imported by `server/scripts/import-pdf-directory.ts`.

## Local (Docker Desktop)

```
docker compose up -d mysql adminer
```

- MySQL: `localhost:3306` (creds from root `.env`)
- Adminer UI: `http://localhost:8080` (server=`mysql`, db=`lionsclub`)
- Schema + seed auto-run on first container start (mounted in `docker-entrypoint-initdb.d`)

To reset:

```
docker compose down -v
docker compose up -d
```

## Tables

| Table              | Purpose                                         |
|--------------------|-------------------------------------------------|
| clubs              | Club record (single tenant)                     |
| roles              | Role definitions + RBAC flags                   |
| members            | Member directory (auth identity = phone_e164)   |
| otps               | OTP code hashes + attempts                      |
| sessions           | Refresh-token hashes for revocation             |
| push_tokens        | Expo push tokens per device                     |
| causes             | LCI service causes                              |
| events             | Club events                                     |
| rsvps              | Per-member event RSVPs                          |
| news               | Announcements / news feed                       |
| service_projects   | Per-cause impact entries                        |
| notifications      | Per-member inbox                                |
| audit_log          | Write-action audit trail                        |

## RBAC

Write actions on club data (events/news/members) check `roles.can_edit_club_data`. President/Secretary/Treasurer = 1; everyone else = 0.
