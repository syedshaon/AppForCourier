// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: string) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth-storage",
    }
  )
);
