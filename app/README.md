# Lions Club App (Expo / React Native)

TypeScript Expo app. React Navigation (bottom tabs + native stack). Zustand + React Query. Phone OTP auth. Expo Notifications.

## Setup

```
cd app
cp .env.example .env       # (optional — extra.apiBaseUrl in app.json wins for Expo)
npm install
npm start                  # Expo dev server
```

Set the API URL in `app.json` → `expo.extra.apiBaseUrl`. Use your machine's LAN IP (not `localhost`) when testing on a physical phone.

## Project layout

```
app/
  App.tsx
  app.json
  babel.config.js
  assets/                  icon, splash, notification icons
  src/
    theme/tokens.ts        Design tokens (mirror screens/tokens.jsx)
    lib/
      api.ts               Fetch wrapper + 401 refresh
      auth.ts              Zustand store + SecureStore
      queryClient.ts       React Query
      push.ts              Expo push registration
    components/            Screen, Card, Avatar, Button, Pill
    navigation/
      RootNavigator.tsx    Switch on auth state
      AuthStack.tsx        Phone → OTP
      MainTabs.tsx         Home / Roster / Events / News / Profile
    screens/
      auth/{PhoneScreen,OtpScreen}.tsx
      main/{HomeScreen,RosterScreen,EventsScreen,NewsScreen,ProfileScreen,
            MemberDetailScreen,EventDetailScreen,NewsDetailScreen,
            ProfileEditScreen,OfficerAdminScreen,ServiceContentScreen,InfoScreen}.tsx
```

## Auth flow

1. User enters phone → `POST /auth/otp/request`.
2. OTP arrives (in dev: printed in server logs).
3. User enters OTP → `POST /auth/otp/verify` → access + refresh tokens stored in SecureStore.
4. `api.ts` attaches `Authorization: Bearer <access>` and retries once on 401 by hitting `/auth/refresh`.
5. On 401 refresh failure → logout.

## Push notifications

On first login `registerForPush()` requests permission, obtains an Expo push token, and `POST /push/register` saves it server-side. Server fan-out happens in `server/src/services/push.ts` on new events / news.

## Editor (officer) UI

Members with `canEdit = true` (President, Secretary, Treasurer) see the "Officer Admin" entry on Events tab (+) and Profile. Used to create events and publish news.
