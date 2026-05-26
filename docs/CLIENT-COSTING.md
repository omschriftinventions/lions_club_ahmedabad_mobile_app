# Lions Club of Ahmedabad host (Main) — Mobile App Costing

**Project:** Native iOS + Android mobile app for club members
**District:** 3232 B1
**Prepared for:** Lions Club of Ahmedabad host (Main)
**Currency:** Indian Rupees (₹), inclusive of 18% GST where applicable
**Validity:** 30 days from issue date

---

## 1. One-time development cost

| Item | Cost |
|------|-----:|
| One-time development using AI (React Native, Expo SDK 54) | ₹15,000 |
| Backend API (Node.js + Express + MariaDB) | included |
| Database schema, data migration, seed data | included |
| 41 screens — Home, Roster, Events, RSVP, News, Chat, Service projects, Awards, Meeting minutes, Officer admin, Notifications, etc. | included |
| Phone-based OTP authentication with JWT tokens | included |
| Role-based access (President, Secretary, Treasurer = editors) | included |
| Push notifications (Expo Push Service) | included |
| Member directory import scripts (PDF + CSV) | included |
| **Subtotal — one-time development using AI** | **₹15,000** |

---

## 2. First-year one-time & setup fees

| Item | Cost | Notes |
|------|-----:|-------|
| Google Play Console account | ₹2,500 | Lifetime, one-time |
| Apple Developer Program — Year 1 fee | ₹9,900 | Mandatory only if iOS App Store publishing |
| DLT registration for transactional SMS (TRAI requirement) | ₹5,900 | Sender ID + template registration, mandatory in India |
| **Subtotal — Android-only (exclude Apple)** | **₹8,400** | |
| **Subtotal — Android + iOS** | **₹18,300** | |

---

## 3. Annual recurring costs

### Year 1 (with promotional pricing on hosting) — Apple already counted in Section 2

| Item | Cost | Notes |
|------|-----:|-------|
| GoDaddy Linux Web Hosting — Deluxe Plan (Year 1 promo) | ₹3,950 | Cheapest plan with Node.js support |
| Domain registration (`.com` or `.in`) | ₹999 | First year |
| SSL certificate | Free | GoDaddy AutoSSL included |
| SMS gateway recharge (MSG91 / Fast2SMS) | ₹1,500 | ~6,000-7,000 OTPs covered |
| Backup & monitoring | Free | cPanel built-in basic backups |
| Push notifications (Expo) | Free | Free tier sufficient |
| **Year 1 recurring (Android or iOS)** | **₹6,449** | Identical regardless of platform |

### Year 2 onwards (renewal pricing)

| Item | Cost | Notes |
|------|-----:|-------|
| GoDaddy Deluxe hosting renewal | ₹11,990 | Standard renewal rate |
| Domain renewal | ₹999 | |
| SSL certificate | Free | |
| Apple Developer Program | ₹9,900 | Mandatory annual renewal for iOS |
| SMS gateway recharge | ₹1,500 | |
| **Year 2+ recurring (Android-only)** | **₹14,489** | |
| **Year 2+ recurring (Android + iOS)** | **₹24,389** | |

---

## 4. Optional / variable costs

| Item | Cost | When needed |
|------|-----:|-------------|
| Photo / file storage (AWS S3 or equivalent) | ₹200 – ₹500 / yr | Only if image uploads enabled (URL paste works free) |
| EAS Build paid tier (Expo) | ₹1,600 / mo | Only if free 30 Android builds/mo exhausted |
| Annual maintenance & support contract | ₹25,000 – ₹40,000 / yr | Recommended — covers bug fixes, OS update compatibility, store re-submissions, content tweaks |
| New feature development | Hourly / per-quote | Major new screens, integrations, redesigns |
| Custom SMS template additions | ₹500 – ₹1,500 each | DLT requires re-approval for any new SMS format |

---

## 5. Summary

### Android-only deployment (lowest cost path)

| | Year 1 | Year 2 | Year 3 |
|---|------:|------:|------:|
| One-time development using AI | ₹15,000 | — | — |
| First-year setup (Google Play + DLT) | ₹8,400 | — | — |
| Annual recurring | ₹6,449 | ₹14,489 | ₹14,489 |
| **Total** | **₹29,849** | **₹14,489** | **₹14,489** |

### Android + iOS deployment

| | Year 1 | Year 2 | Year 3 |
|---|------:|------:|------:|
| One-time development using AI | ₹15,000 | — | — |
| First-year setup (Google Play + DLT + Apple Year 1) | ₹18,300 | — | — |
| Annual recurring | ₹6,449 | ₹24,389 | ₹24,389 |
| **Total** | **₹39,749** | **₹24,389** | **₹24,389** |

---

## 6. Recommendation

**Recommended path:**
1. **Year 1, Phase A (Months 1–3):** Launch Android-only via Google Play. Total cost ₹29,849. Low risk, fast user adoption.
2. **Year 1, Phase B (Months 4–6):** If member feedback positive, add iOS by purchasing Apple Developer Program. Add ₹9,900.
3. **Year 2+:** Renew both platforms. ~₹24,000/year total.

**Annual maintenance contract** (₹25,000–₹40,000/yr) strongly advised to cover:
- iOS / Android annual OS update compatibility (Apple typically forces SDK upgrades yearly)
- Bug fixes
- Adding new members, updating roles, content
- Quarterly app version submissions (both stores expect periodic updates)

---

## 7. Cost saving alternatives

If GoDaddy renewal cost feels high in Year 2+, the following swaps reduce hosting to ~₹4,800/yr:

| Alternative | Annual Cost | Trade-off |
|-------------|------------:|-----------|
| Hostinger Premium (India) | ₹4,800 | Same features, less brand recognition |
| Hostinger Cloud Startup | ₹6,400 | More resources |
| DigitalOcean Droplet 1GB | ₹4,800 ($4/mo) | Full VPS control, more setup effort |

Switching mid-contract is straightforward — backup database, restore on new host, update DNS.

---

## 8. What's included vs not

### Included in the ₹15,000 one-time AI-assisted development cost
- All 41 mobile screens already built
- Backend REST API with 18 endpoints
- MariaDB schema with 21 tables
- OTP-based authentication
- Push notifications wired
- Role-based admin controls
- Android APK build via EAS
- Initial deployment assistance (1 round)
- Code handover + documentation

### NOT included (would be quoted separately)
- App store submission (separate process, ~₹5,000 effort)
- Member directory data entry from existing PDF (~₹2,000–₹5,000 depending on volume)
- Custom logo / branding design
- iOS App Store-specific assets (screenshots, App Store description, privacy policy hosting)
- Third-party integrations (payment gateway, calendar sync, etc.)
- Multi-language support (currently English only)
- Public-facing website
- Hardware (no on-premise server needed — fully cloud-hosted)

---

## 9. Payment schedule (suggested)

| Milestone | % of Dev Cost | Amount |
|-----------|--------------:|-------:|
| Project kickoff | 30% | ₹4,500 |
| Mid-development demo | 40% | ₹6,000 |
| Final delivery + go-live | 30% | ₹4,500 |
| **Total (one-time development using AI)** | **100%** | **₹15,000** |

One-time setup fees (Google Play, DLT) and annual recurring fees are pass-through — paid directly by the client to the respective vendor or reimbursed at cost.

---

## 10. Notes & assumptions

- All prices are indicative based on May 2026 rates and are subject to change by the respective vendors (GoDaddy, Apple, Google, SMS providers).
- 18% GST included in Apple / Google / GoDaddy figures where applicable.
- Hosting plan assumes ≤500 active members. For larger clubs, upgrade to GoDaddy Ultimate (~₹17,988/yr) or VPS.
- Maintenance contract starts from Month 13 (post-launch year).
- All vendor accounts (GoDaddy, Apple, Google) will be created in the client's name. Client retains ownership.

---

*Prepared by Omsinv* · *Lions Club Ahmedabad Host Mobile App — Costing Document*
