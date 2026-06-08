import { create } from "zustand";
import { saveToken, removeToken } from "@/lib/auth";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,

  login: (token: string) => {
    saveToken(token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    removeToken();
    set({ token: null, isAuthenticated: false });
    window.location.href = "/login";
  },
}));
