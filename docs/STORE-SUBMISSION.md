# Store Submission Playbook — Lions Club Ahmedabad Host

App: **Lions Club Ahmedabad Host** · `com.lionsclub.ahmedabad` · v0.2.0
API: `https://api.lionsclubofahmedabadhost.com` (production, hardened)
Auth: phone + password (reviewer-friendly, no SMS needed)

---

## 0. Already done (this session)

- [x] Production server: `NODE_ENV=production`, `DEV_BYPASS_OTP=false`, `OTP_DEV_LOG=false`, pm2 restarted
- [x] Production Android AAB build triggered (auto-increments versionCode)
- [x] Production iOS App Store build triggered (distribution cert provisioned)
- [x] `eas.json` submit profiles scaffolded

---

## 1. Prerequisites — both stores

| Item | Status / Action |
|------|-----------------|
| Privacy policy URL | **REQUIRED by both stores.** Host at `https://lionsclubofahmedabadhost.com/privacy`. Must cover: what data collected (name, phone, email, photos, meeting audio), why, retention, deletion contact. |
| Support URL / email | e.g. `support@omsinv.com` or club secretary email |
| App icon 1024×1024 PNG (no alpha, no rounded corners) | Export from `app/assets/icon.png` — verify 1024px |
| Reviewer demo account | Create dedicated member: name "App Reviewer", phone `9000000001`, password set via Manage Roster. **Do NOT hand out super admin.** |

### Create reviewer account (web → Manage Roster → Add Member, or SQL):

```sql
-- password hash: set via web UI "set password" = simplest
INSERT INTO members (club_id, role_id, name, initials, phone, phone_e164, active)
VALUES (1, (SELECT id FROM roles WHERE code='MEMBER'), 'App Reviewer', 'AR', '+91 90000 00001', '+919000000001', 1);
```
Then web → Manage Roster → App Reviewer → Set password → e.g. `Review@2026`.

---

## 2. Google Play — step by step

### A. Create app in Play Console
1. https://play.google.com/console → **Create app**
2. Name: `Lions Club Ahmedabad Host` · Default language: English (India) · App/Game: App · Free
3. Declarations: check all applicable boxes.

### B. Store listing (Main store listing)
- **Short description** (80 chars max):
  `Private member app for Lions Club of Ahmedabad host (Main) — District 3232 B1`
- **Full description** (see §5 below)
- **Screenshots:** min 2 phone screenshots (1080×1920 or similar 9:16). Capture from real device: Home, Events, Roster, Meeting summary.
- **Feature graphic:** 1024×500 PNG (required). Simple: navy background + logo + app name.
- App icon 512×512 (Play Console auto-scales from listing upload).

### C. App content section (all required before release)
| Form | Answer |
|------|--------|
| Privacy policy | paste URL |
| Ads | No ads *(unless AdCarousel shows third-party paid ads — if ads are sponsor banners you control, still "No" for AdMob-style ads; declare "Yes" only if serving ad-network content)* |
| App access | **Restricted access** → provide reviewer credentials: phone `9000000001` + password `Review@2026` + note "Select Password login, enter phone and password" |
| Content ratings | Complete IARC questionnaire → social/communication app, no UGC moderation issues expected; answer honestly re: user communication (chat exists → yes) |
| Target audience | 18+ (club members are adults) — avoids Families policy burden |
| News app | No |
| COVID-19 | No |
| Data safety | See §4 below |
| Government app | No |

### D. Upload build
1. **Testing → Internal testing** → Create release
2. Upload AAB (download from EAS link, or wire `eas submit`)
3. Release notes: `First public release — member directory, events & RSVP, news, chat, meeting recordings with AI summaries.`
4. Roll out to internal → test on real device via opt-in link
5. When satisfied: **Production → Create release** → same AAB → **Submit for review**

### E. Or submit from CLI (after one-time service account setup)
1. Play Console → Setup → API access → create Google Cloud service account → grant "Release manager"
2. Download JSON key → save as `app/google-play-service-account.json` (gitignored)
3. ```
   cd app
   npx eas-cli submit --platform android --profile production --latest
   ```

**Review time:** first submission 3–7 days (new developer accounts get extra scrutiny; 14-day closed-testing requirement applies to *personal* accounts created after Nov 2023 — organisation accounts exempt).

---

## 3. Apple App Store — step by step

### A. Create app in App Store Connect
1. https://appstoreconnect.apple.com → My Apps → **+** → New App
2. Platform iOS · Name: `Lions Club Ahmedabad Host` · Primary language: English (India or U.K.)
3. Bundle ID: select `com.lionsclub.ahmedabad` (registered by EAS)
4. SKU: `lionsclub-ahmedabad-01`
5. Note the **Apple ID of the app** (numeric, e.g. 6740000000) → paste into `eas.json` → `submit.production.ios.ascAppId`

### B. Upload build
```
cd app
npx eas-cli submit --platform ios --profile production --latest
```
EAS uploads the IPA to App Store Connect (TestFlight processing ~15-30 min).

### C. App information
- Category: **Social Networking** (primary), Business (secondary)
- Content rights: confirm you own/licensed content
- Age rating questionnaire: unrestricted web access No; user-generated content → chat exists → answer accordingly (typically 17+ not needed; 4+ with "Infrequent/Mild" nothing → Apple usually rates such apps 4+ or 12+)

### D. App Privacy (nutrition labels)
Declare (see §4): Contact Info (name, phone, email), User Content (photos, audio recordings, messages), Identifiers (user ID). All "Linked to you", none used for tracking. **Tracking: No.**

### E. Version page (1.0 / 0.2.0)
- Screenshots: **6.7" (1290×2796) required** + 6.5" (1284×2778 or 1242×2688). Take on iPhone 15 Pro Max simulator or device, or resize.
- Promotional text (170 chars, optional)
- Description: §5
- Keywords (100 chars): `lions club,ahmedabad,member,directory,events,rsvp,service,district 3232,meetings,club`
- Support URL + Marketing URL (club website)
- **App Review Information:**
  - Sign-in required: YES → Demo account: phone `9000000001`, password `Review@2026`
  - Notes: `Private membership app for a Lions Clubs International chapter. Tap "Password" login if prompted, enter the demo phone number and password. Meeting recorder requires microphone permission — a sample recorded meeting with AI summary is available under Meetings tab.`
  - Contact: your phone + email (Apple may call)

### F. Submit
Add build to version page → **Add for Review** → Submit.

**Review time:** typically 24–48 h. Rejections common on first pass — usually metadata or demo-account issues; fix + resubmit is quick.

---

## 4. Data safety / privacy declarations (both stores)

Data the app collects:

| Data | Purpose | Shared? | Notes |
|------|---------|---------|-------|
| Name, phone, email | Account + member directory | Visible to other members | Core function |
| Photos (profile, gallery) | App functionality | Visible to members | User uploads |
| Meeting audio recordings | Transcription + AI summary | Sent to STT (Groq) + LLM (OpenRouter) processors | **Declare: audio data collected, processed by third-party AI providers** |
| Chat messages | Member communication | Visible to thread members | |
| Push token | Notifications | No | Expo push service |

**Important:** meeting audio → third-party AI (Groq, OpenRouter). Mention in privacy policy explicitly: "Meeting recordings are transcribed and summarised using third-party AI processing services." Skipping this is a policy violation risk on both stores.

No advertising SDK, no analytics SDK, no tracking → "Data not used for tracking" everywhere.

---

## 5. Store description (shared copy)

**Short/subtitle:** Member app for Lions Club