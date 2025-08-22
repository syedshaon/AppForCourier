// src/components/auth/AuthInitializer.tsx
import { useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../services/api";

const AuthInitializer = () => {
  const { login, logout } = useAuthStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent running multiple times
    if (initializedRef.current) return;
    initializedRef.current = true;

    // console.log("AuthInitializer running");

    const initializeAuth = async () => {
      // Check if we have a token in localStorage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        try {
          // Verify the token is still valid by getting user profile
          const response = await authApi.getProfile();
          // console.log("Profile response:", response.data);

          // Extract user data based on your API response structure
          const userData = response.data.data?.user || response.data.user || response.data;
          // console.log("Extracted user data:", userData);

          if (userData && userData.id) {
            // Update the store with fresh user data
            login(userData, storedToken);
          } else {
            console.error("No valid user data in profile response");
            logout();
          }
        } catch (error) {
          // Token is invalid, logout
          console.error("Token validation failed:", error);
          logout();
        }
      } else {
        console.log("No stored token found");
      }
    };

    initializeAuth();
  }, [login, logout]); // Add dependencies

  return null;
};

export default AuthInitializer;
