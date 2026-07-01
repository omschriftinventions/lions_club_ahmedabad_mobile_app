// Web: push notifications are not supported via expo-notifications.
// Return null so App() skips registration on web. (Use the in-app Notifications
// inbox on web; add Web Push + service worker later if needed.)
export async function registerForPush(): Promise<string | null> {
  return null;
}