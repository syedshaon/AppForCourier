// src/components/auth/AuthInitializer.tsx
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../services/api";

const AuthInitializer = () => {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("auth-storage");

      if (token) {
        try {
          // Verify the token is still valid
          const response = await authApi.getProfile();
          const user = response.data.user;

          // Update the store with fresh user data
          login(user, token);
        } catch (error) {
          // Token is invalid, logout
          console.error("Token validation failed:", error);
          logout();
        }
      }
    };

    initializeAuth();
  }, [login, logout]);

  return null;
};

export default AuthInitializer;
