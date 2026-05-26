import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const KEY_ACCESS = 'lc.access';
const KEY_REFRESH = 'lc.refresh';
const KEY_MEMBER = 'lc.member';
const API_BASE = (Constants.expoConfig?.extra as any)?.apiBaseUrl ?? 'http://localhost:4000';

export interface AuthMember {
  id: number;
  name: string;
  role: string;
  canEdit: boolean;
  clubId: number;
}

interface AuthState {
  access: string | null;
  refresh: string | null;
  member: AuthMember | null;
  ready: boolean;
  hydrate: () => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  tryRefresh: () => Promise<boolean>;
}

async function setSecure(k: string, v: string | null) {
  if (v == null) await SecureStore.deleteItemAsync(k);
  else await SecureStore.setItemAsync(k, v);
}

export const useAuth = create<AuthState>((set, get) => ({
  access: null,
  refresh: null,
  member: null,
  ready: false,

  hydrate: async () => {
    const [access, refresh, memberStr] = await Promise.all([
      SecureStore.getItemAsync(KEY_ACCESS),
      SecureStore.getItemAsync(KEY_REFRESH),
      SecureStore.getItemAsync(KEY_MEMBER),
    ]);
    set({
      access,
      refresh,
      member: memberStr ? JSON.parse(memberStr) : null,
      ready: true,
    });
  },

  requestOtp: async (phone) => {
    const res = await fetch(`${API_BASE}/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) throw new Error('otp_request_failed');
  },

  verifyOtp: async (phone, code) => {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phone, code }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'otp_verify_failed');
    }
    const data = await res.json() as { access: string; refresh: string; member: AuthMember };
    await Promise.all([
      setSecure(KEY_ACCESS, data.access),
      setSecure(KEY_REFRESH, data.refresh),
      setSecure(KEY_MEMBER, JSON.stringify(data.member)),
    ]);
    set({ access: data.access, refresh: data.refresh, member: data.member });
  },

  logout: async () => {
    const r = get().refresh;
    if (r) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ refresh: r }),
      }).catch(() => {});
    }
    await Promise.all([
      setSecure(KEY_ACCESS, null),
      setSecure(KEY_REFRESH, null),
      setSecure(KEY_MEMBER, null),
    ]);
    set({ access: null, refresh: null, member: null });
  },

  tryRefresh: async () => {
    const r = get().refresh;
    if (!r) return false;
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ refresh: r }),
    });
    if (!res.ok) {
      await get().logout();
      return false;
    }
    const data = await res.json() as { access: string };
    await setSecure(KEY_ACCESS, data.access);
    set({ access: data.access });
    return true;
  },
}));
