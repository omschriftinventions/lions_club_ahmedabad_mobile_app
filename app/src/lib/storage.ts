import * as SecureStore from 'expo-secure-store';

// Native storage (iOS/Android). On web, metro resolves storage.web.ts instead.
export const getItem = (k: string): Promise<string | null> => SecureStore.getItemAsync(k);
export const setItem = (k: string, v: string): Promise<void> => SecureStore.setItemAsync(k, v);
export const deleteItem = (k: string): Promise<void> => SecureStore.deleteItemAsync(k);