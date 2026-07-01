// Web storage (browser). Uses localStorage; no SecureStore on web.
export const getItem = (k: string): Promise<string | null> => Promise.resolve(localStorage.getItem(k));
export const setItem = (k: string, v: string): Promise<void> => {
  localStorage.setItem(k, v);
  return Promise.resolve();
};
export const deleteItem = (k: string): Promise<void> => {
  localStorage.removeItem(k);
  return Promise.resolve();
};