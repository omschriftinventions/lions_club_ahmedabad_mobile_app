import { create } from 'zustand';
import { api, API_BASE } from './api';

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
  devLogin: (memberId?: number) => Promise<void>;
  loginWithPassword: (phone: string, password: string) => Promise<void>;
}

const KEY = 'lions.auth';

function load(): { access: string | null; refresh: string | null; member: AuthMember | null } {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { access: null, refresh: null, member: null };
  } catch {
    return { access: null, refresh: null, member: null };
  }
}

function save(s: { access: string | null; refresh: string | null; member: AuthMember | null }) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const useAuth = create<AuthState>((set, get) => ({
  access: null,
  refresh: null,
  member: null,
  ready: false,

  hydrate: async () => {
    const s = load();
    set({ access: s.access, refresh: s.refresh, member: s.member, ready: true });
  },

  requestOtp: async (phone) => {
    const res = await fetch(`${API_BASE}/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) throw new Error('otp_request_failed');
  },

  verifyOtp: async (phone, code) => {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'otp_verify_failed');
    }
    const data = await res.json() as { access: string; refresh: string; member: AuthMember };
    save({ access: data.access, refresh: data.refresh, member: data.member });
    set({ access: data.access, refresh: data.refresh, member: data.member });
  },

  logout: async () => {
    const r = get().refresh;
    if (r) api.post('/auth/logout', { refresh: r }).catch(() => {});
    localStorage.removeItem(KEY);
    set({ access: null, refresh: null, member: null });
  },

  tryRefresh: async () => {
    const r = get().refresh;
    if (!r) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: r }),
      });
      if (!res.ok) return false;
      const data = await res.json() as { access: string };
      const s = { access: data.access, refresh: r, member: get().member };
      save(s);
      set({ access: data.access });
      return true;
    } catch {
      return false;
    }
  },

  devLogin: async (memberId?: number) => {
    const res = await fetch(`${API_BASE}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: memberId ?? null }),
    });
    if (!res.ok) throw new Error('dev_login_failed');
    const data = await res.json() as { access: string; refresh: string; member: AuthMember };
    save({ access: data.access, refresh: data.refresh, member: data.member });
    set({ access: data.access, refresh: data.refresh, member: data.member });
  },

  loginWithPassword: async (phone, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'login_failed');
    }
    const data = await res.json() as { access: string; refresh: string; member: AuthMember };
    save({ access: data.access, refresh: data.refresh, member: data.member });
    set({ access: data.access, refresh: data.refresh, member: data.member });
  },
}));