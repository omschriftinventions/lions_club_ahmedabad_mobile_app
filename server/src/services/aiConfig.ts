import { getSetting, setSetting } from '../settings';
import { config } from '../config';

/**
 * Admin-configurable AI settings, stored in app_settings and editable from
 * the Admin page (web + mobile). Resolution order per field:
 *   DB value  >  server .env  >  OpenRouter default.
 * Cached briefly so the meeting-summary pipeline doesn't hit the DB on
 * every LLM call; the admin save endpoint invalidates the cache.
 */
export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  chatModel: string;
  chatModelFallback: string;
}

const KEYS = {
  baseUrl: 'ai_base_url',
  apiKey: 'ai_api_key',
  chatModel: 'ai_chat_model',
  chatModelFallback: 'ai_chat_model_fallback',
} as const;

export const AI_DEFAULTS: AIConfig = {
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: '',
  chatModel: 'anthropic/claude-haiku-4.5',
  chatModelFallback: 'nvidia/nemotron-3-super-120b-a12b:free',
};

const CACHE_TTL_MS = 60_000;
let cache: { value: AIConfig; at: number } | null = null;

export function invalidateAIConfigCache(): void {
  cache = null;
}

export async function getAIConfig(): Promise<AIConfig> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;

  const [baseUrl, apiKey, chatModel, chatModelFallback] = await Promise.all([
    getSetting(KEYS.baseUrl, ''),
    getSetting(KEYS.apiKey, ''),
    getSetting(KEYS.chatModel, ''),
    getSetting(KEYS.chatModelFallback, ''),
  ]);

  const value: AIConfig = {
    baseUrl: baseUrl || config.ai.baseUrl || AI_DEFAULTS.baseUrl,
    apiKey: apiKey || config.ai.apiKey || AI_DEFAULTS.apiKey,
    chatModel: chatModel || config.ai.chatModel || AI_DEFAULTS.chatModel,
    chatModelFallback: chatModelFallback || config.ai.chatModelFallback || AI_DEFAULTS.chatModelFallback,
  };
  cache = { value, at: Date.now() };
  return value;
}

export async function saveAIConfig(input: {
  baseUrl?: string;
  apiKey?: string;       // empty/undefined = keep existing key
  chatModel?: string;
  chatModelFallback?: string;
}): Promise<void> {
  if (input.baseUrl !== undefined) await setSetting(KEYS.baseUrl, input.baseUrl.trim().replace(/\/+$/, ''));
  if (input.apiKey) await setSetting(KEYS.apiKey, input.apiKey.trim());
  if (input.chatModel !== undefined) await setSetting(KEYS.chatModel, input.chatModel.trim());
  if (input.chatModelFallback !== undefined) await setSetting(KEYS.chatModelFallback, input.chatModelFallback.trim());
  invalidateAIConfigCache();
}

/** Mask an API key for display: keep first 6 + last 4 chars. */
export function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 12) return '••••••••';
  return key.slice(0, 6) + '••••••••' + key.slice(-4);
}
