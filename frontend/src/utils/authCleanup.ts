// src/utils/authCleanup.ts
import { useAuthStore } from "../store/authStore";

export const checkAndFixAuthState = () => {
  // Check for inconsistent state between localStorage and store
  const storedRefreshToken = localStorage.getItem("refreshToken");
  const storeState = useAuthStore.getState();

  // If we have a refresh token in localStorage but not in store, or vice versa
  if (storedRefreshToken && !storeState.refreshToken) {
    console.log("Fixing inconsistent auth state: refresh token in localStorage but not in store");
    useAuthStore.getState().setRefreshToken(storedRefreshToken);
  } else if (!storedRefreshToken && storeState.refreshToken) {
    console.log("Fixing inconsistent auth state: refresh token in store but not in localStorage");
    localStorage.setItem("refreshToken", storeState.refreshToken);
  }

  // Remove old authToken if it exists (legacy)
  if (localStorage.getItem("authToken")) {
    console.log("Removing legacy authToken");
    localStorage.removeItem("authToken");
  }
};
