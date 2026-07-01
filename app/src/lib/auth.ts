import { create } from 'zustand';
import Constants from 'expo-constants';
import { getItem, setItem, deleteItem } from './storage';

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
  superAdmin?: boolean;
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
  loginWithPassword: (phone: string, password: string) => Promise<void>;
}

async function storeVal(k: string, v: string | null) {
  if (v == null) await deleteItem(k);
  else await setItem(k, v);
}

export const useAuth = create<AuthState>((set, get) => ({
  access: null,
  refresh: null,
  member: null,
  ready: false,

  hydrate: async () => {
    const [access, refresh, memberStr] = await Promise.all([
      getItem(KEY_ACCESS),
      getItem(KEY_REFRESH),
      getItem(KEY_MEMBER),
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
      storeVal(KEY_ACCESS, data.access),
      storeVal(KEY_REFRESH, data.refresh),
      storeVal(KEY_MEMBER, JSON.stringify(data.member)),
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
      storeVal(KEY_ACCESS, null),
      storeVal(KEY_REFRESH, null),
      storeVal(KEY_MEMBER, null),
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
    await storeVal(KEY_ACCESS, data.access);
    set({ access: data.access });
    return true;
  },

  loginWithPassword: async (phone, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'login_failed');
    }
    const data = await res.json() as { access: string; refresh: string; member: AuthMember };
    await Promise.all([
      storeVal(KEY_ACCESS, data.access),
      storeVal(KEY_REFRESH, data.refresh),
      storeVal(KEY_MEMBER, JSON.stringify(data.member)),
    ]);
    set({ access: data.access, refresh: data.refresh, member: data.member });
  },
}));