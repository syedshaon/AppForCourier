// src/utils/authCleanup.ts
import { useAuthStore } from "../store/authStore";
export const checkAndFixAuthState = () => {
  const { user, token, isAuthenticated } = useAuthStore.getState();

  console.log("Checking auth state consistency:", { user, token, isAuthenticated });

  // Fix inconsistent state
  if ((token && !user) || (isAuthenticated && !user)) {
    console.log("Fixing inconsistent auth state");
    useAuthStore.getState().logout();
    return false;
  }

  return true;
};

// Call this function in your App.tsx or main component
