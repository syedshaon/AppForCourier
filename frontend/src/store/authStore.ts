// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../services/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null; // access token only
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
        // Call backend to clear cookie
        authApi.logout();
      },

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      initializeAuth: async () => {
        if (get().isInitialized) return;

        try {
          // Call backend refresh endpoint → cookie is sent automatically
          const response = await authApi.refreshToken();
          const { user, token } = response.data.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isInitialized: true,
          });
        } catch (err) {
          console.error("Auth init failed:", err);
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
