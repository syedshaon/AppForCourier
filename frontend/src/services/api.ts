import axios from "axios";
import { useAuthStore } from "../store/authStore";
import type { LoginCredentials } from "@/types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ send cookies automatically (important!)
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // console.log("API error interceptor:", error.config?.url, error.response?.status);
    const originalRequest = error.config;

    // Don't refresh token on login/register requests
    if (error.config?.url.includes("/auth/login") || error.config?.url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    // If error is 401 and request has not been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // console.log("Attempting token refresh...");
      if (isRefreshing) {
        // Wait for ongoing refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // console.log("Refreshing token...");
      try {
        // ✅ Call refresh endpoint — refresh token is in HttpOnly cookie
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });

        // console.log("Token refreshed:", response.data);

        const { token: newAccessToken } = response.data.data;

        // ✅ Update only access token in store
        useAuthStore.getState().setToken(newAccessToken);

        // Retry queued requests
        processQueue(null, newAccessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // console.error("Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Auth API calls
export const authApi = {
  login: (credentials: LoginCredentials) => api.post("/auth/login", credentials, { withCredentials: true }),

  register: (data: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string; address?: string }) => api.post("/auth/register", data),

  logout: () => api.post("/auth/logout", {}, { withCredentials: true }),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (data: { firstName?: string; lastName?: string; phoneNumber?: string; address?: string }) => api.put("/auth/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put("/auth/change-password", data),

  refreshToken: () => api.post("/auth/refresh", {}, { withCredentials: true }),

  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (data: { email: string }) => api.post("/auth/resend-verification", data),

  requestPasswordReset: (data: { email: string }) => api.post("/auth/forgot-password", data),

  resetPassword: (data: { token: string; newPassword: string }) => api.post("/auth/reset-password", data),
};

// ✅ Parcel, Address, Transaction, Admin APIs stay the same

export const parcelApi = {
  createParcel: (data: any) => api.post("/parcels", data),
  getUserParcels: (params?: any) => api.get("/parcels/my-parcels", { params }),
  getAgentParcels: (params?: any) => api.get("/parcels/assigned", { params }),
  getAllParcels: (params?: any) => api.get("/parcels", { params }),
  getById: (id: string) => api.get(`/parcels/${id}`),
  getParcelById: (id: string) => api.get(`/parcels/${id}`),
  trackParcel: (trackingNumber: string) => api.get(`/parcels/track/${trackingNumber}`),
  updateStatus: (parcelId: string, data: any) => api.patch(`/parcels/${parcelId}/status`, data),

  assignAgent: (parcelId: string, data: { agentId: string }) => api.patch(`/parcels/${parcelId}/assign`, data),
  deleteParcel: (id: string) => api.delete(`/parcels/${id}`),
  searchParcels: (params: any) => api.get("/parcels/search", { params }),
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
  getUsers: () => api.get("/users"),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  getStats: () => api.get("/stats"),
  getParcelStats: () => api.get("/parcel-stats"),
  getAgents: () => api.get("/users/agents"),
};

export const userApi = {
  // Get all users with optional filters
  getAll: (params?: { role?: string; page?: number; limit?: number; search?: string }) => api.get("/admin/users", { params }),

  // Update user role
  updateRole: (userId: string, data: { role: string }) => api.patch(`/admin/users/${userId}/role`, data),

  // Deactivate user
  deactivate: (userId: string) => api.patch(`/admin/users/${userId}/deactivate`),

  // Activate user
  activate: (userId: string) => api.patch(`/admin/users/${userId}/activate`),

  // Get user by ID
  getById: (userId: string) => api.get(`/admin/users/${userId}`),
};
