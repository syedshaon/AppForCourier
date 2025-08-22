// src/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: string) => {
        // console.log("Login called with:", { user, token });
        set({ user, token, isAuthenticated: true });
        // Also store token in localStorage for API interceptor
        localStorage.setItem("authToken", token);
      },
      logout: () => {
        // console.log("Logout called");
        set({ user: null, token: null, isAuthenticated: false });
        // Remove token from localStorage
        localStorage.removeItem("authToken");
      },
      setUser: (user: User) => {
        // console.log("setUser called with:", user);
        set({ user });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Handle hydration issues
      onRehydrateStorage: () => (state) => {
        console.log("Storage rehydrated:", state);
        // Check if we have inconsistent state after hydration
        if (state && state.token && !state.user) {
          console.log("Inconsistent state: token exists but user is null");
          // Set isAuthenticated to false if user is missing
          state.isAuthenticated = false;
        }
      },
    }
  )
);
