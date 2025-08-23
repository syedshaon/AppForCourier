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
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void; // New method for partial updates
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: false,

      login: (user, token, refreshToken) => {
        set({ user, token, refreshToken, isAuthenticated: true });
        localStorage.setItem("refreshToken", refreshToken);
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isInitialized: true });
        localStorage.removeItem("refreshToken");
      },

      setUser: (user) => set({ user }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      setToken: (token) => set({ token }),

      setRefreshToken: (refreshToken) => {
        set({ refreshToken });
        localStorage.setItem("refreshToken", refreshToken);
      },

      initializeAuth: async () => {
        // If already initialized, skip
        if (get().isInitialized) return;

        try {
          const storedRefreshToken = localStorage.getItem("refreshToken");

          if (storedRefreshToken) {
            try {
              const response = await authApi.refreshToken({ token: storedRefreshToken });
              const { user, token: newToken, refreshToken: newRefreshToken } = response.data.data;

              set({
                user,
                token: newToken,
                refreshToken: newRefreshToken,
                isAuthenticated: true,
                isInitialized: true,
              });
              return;
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              // Refresh token is invalid, clear it
              localStorage.removeItem("refreshToken");
            }
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
        } finally {
          // Mark as initialized even if failed
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
