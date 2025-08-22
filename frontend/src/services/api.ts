// src/services/api.ts
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Try to get token from multiple sources
  let authToken = null;

  // 1. Try from auth store
  const tokenFromStore = useAuthStore.getState().token;
  if (tokenFromStore) {
    authToken = tokenFromStore;
  }

  // 2. Try from localStorage (backup)
  if (!authToken) {
    const tokenFromLocalStorage = localStorage.getItem("authToken");
    if (tokenFromLocalStorage) {
      authToken = tokenFromLocalStorage;
      // Also update the store if token exists in localStorage but not in store
      if (!useAuthStore.getState().token) {
        // We need to get user info to populate the store
        // This will be handled by the AuthInitializer
      }
    }
  }

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token if you have a refresh token mechanism
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await api.post("/auth/refresh", { token: refreshToken });
          const { token, user } = response.data;

          // Update the store
          useAuthStore.getState().login(user, token);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls - Updated to match your backend
export const authApi = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),

  register: (data: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string; address?: string }) => api.post("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (data: { firstName?: string; lastName?: string; phoneNumber?: string; address?: string }) => api.put("/auth/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put("/auth/change-password", data),

  refreshToken: (data: { token: string }) => api.post("/auth/refresh", data),

  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (data: { email: string }) => api.post("/auth/resend-verification", data),

  requestPasswordReset: (data: { email: string }) => api.post("/auth/forgot-password", data),

  resetPassword: (data: { token: string; newPassword: string }) => api.post("/auth/reset-password", data),
};

// Parcel API calls (based on your Prisma schema)
export const parcelApi = {
  getAll: () => api.get("/parcels"),
  getById: (id: string) => api.get(`/parcels/${id}`),
  create: (data: any) => api.post("/parcels", data),
  update: (id: string, data: any) => api.put(`/parcels/${id}`, data),
  delete: (id: string) => api.delete(`/parcels/${id}`),
  getMyParcels: () => api.get("/parcels/my-parcels"),
  getAssignedParcels: () => api.get("/parcels/assigned"),
  updateStatus: (id: string, data: { status: string; notes?: string; latitude?: number; longitude?: number }) => api.post(`/parcels/${id}/status`, data),
};

// Address API calls
export const addressApi = {
  validate: (data: any) => api.post("/addresses/validate", data),
  create: (data: any) => api.post("/addresses", data),
};

// Transaction API calls
export const transactionApi = {
  getAll: () => api.get("/transactions"),
  getById: (id: string) => api.get(`/transactions/${id}`),
  create: (data: any) => api.post("/transactions", data),
};

// Admin API calls
export const adminApi = {
  getUsers: () => api.get("/admin/users"),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  getStats: () => api.get("/admin/stats"),
  getParcelStats: () => api.get("/admin/parcel-stats"),
};
