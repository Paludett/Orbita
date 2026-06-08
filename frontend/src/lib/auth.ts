const TOKEN_KEY = "orbita_access_token";
const COOKIE_KEY = "orbita_token";

export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  // Middleware reads cookies (server-side can't access localStorage)
  document.cookie = `${COOKIE_KEY}=${token}; path=/; SameSite=Strict`;
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const isAuthenticated = (): boolean => !!getToken();
