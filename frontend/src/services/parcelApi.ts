// src/services/api/parcelApi.ts
import { api } from "./api";

export const parcelApi = {
  createParcel: (data: any) => api.post("/parcels", data),
  getUserParcels: (params?: any) => api.get("/parcels/my-parcels", { params }),
  getAgentParcels: (params?: any) => api.get("/parcels/assigned", { params }),
  getAllParcels: (params?: any) => api.get("/parcels", { params }),
  getParcelById: (id: string) => api.get(`/parcels/${id}`),
  trackParcel: (trackingNumber: string) => api.get(`/parcels/track/${trackingNumber}`),
  updateStatus: (parcelId: string, data: any) => api.patch(`/parcels/${parcelId}/status`, data),

  assignAgent: (parcelId: string, data: { agentId: string }) => api.patch(`/parcels/${parcelId}/assign`, data),
  deleteParcel: (id: string) => api.delete(`/parcels/${id}`),
  searchParcels: (params: any) => api.get("/parcels/search", { params }),
};
