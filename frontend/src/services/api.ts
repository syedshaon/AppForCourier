import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
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
    console.log("API error interceptor:", error.config?.url, error.response?.status);
    const originalRequest = error.config;

    // For login requests, don't try to refresh token
    if (error.config?.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { token: refreshToken });
        const { token: newAccessToken, refreshToken: newRefreshToken, user } = response.data.data;

        // Update the store
        useAuthStore.getState().setToken(newAccessToken);
        useAuthStore.getState().setRefreshToken(newRefreshToken);

        // Process the queue of failed requests
        processQueue(null, newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
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

// Auth API calls - Updated to handle refresh tokens
export const authApi = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),

  register: (data: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string; address?: string }) => api.post("/auth/register", data),

  logout: () => {
    const token = useAuthStore.getState().token;
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post("/auth/logout", {}, config);
  },

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
// export const parcelApi = {
//   getAll: () => api.get("/parcels"),
//   getById: (id: string) => api.get(`/parcels/${id}`),
//   create: (data: any) => api.post("/parcels", data),
//   update: (id: string, data: any) => api.put(`/parcels/${id}`, data),
//   delete: (id: string) => api.delete(`/parcels/${id}`),
//   getMyParcels: () => api.get("/parcels/my-parcels"),
//   getAssignedParcels: () => api.get("/parcels/assigned"),
//   updateStatus: (id: string, data: { status: string; notes?: string; latitude?: number; longitude?: number }) => api.post(`/parcels/${id}/status`, data),
// };

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
  getUsers: () => api.get("/admin/users"),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  getStats: () => api.get("/admin/stats"),
  getParcelStats: () => api.get("/admin/parcel-stats"),
  getAgents: () => api.get("/users/admin/agents"),
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
