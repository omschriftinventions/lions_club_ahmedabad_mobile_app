import Constants from 'expo-constants';
import { useAuth } from './auth';

const API_BASE = (Constants.expoConfig?.extra as any)?.apiBaseUrl ?? 'http://localhost:4000';

export interface ApiError extends Error { status: number; code?: string; }

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = useAuth.getState().access;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Bypass ngrok's free-tier browser interstitial page so JSON responses are returned directly.
    'ngrok-skip-browser-warning': 'true',
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401 && retry) {
    const ok = await useAuth.getState().tryRefresh();
    if (ok) return request<T>(path, init, false);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`) as ApiError;
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data as T;
}

export const api = {
  base: API_BASE,
  get:    <T>(p: string)                  => request<T>(p),
  post:   <T>(p: string, b?: any)         => request<T>(p, { method: 'POST',  body: b ? JSON.stringify(b) : undefined }),
  put:    <T>(p: string, b?: any)         => request<T>(p, { method: 'PUT',   body: b ? JSON.stringify(b) : undefined }),
  patch:  <T>(p: string, b?: any)         => request<T>(p, { method: 'PATCH', body: b ? JSON.stringify(b) : undefined }),
  delete: <T>(p: string)                  => request<T>(p, { method: 'DELETE' }),
};
