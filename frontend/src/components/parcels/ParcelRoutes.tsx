// src/components/parcels/ParcelRoutes.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import AdminRoute from "../auth/AdminRoute";
import AgentRoute from "../auth/AgentRoute";
import CreateParcelForm from "./CreateParcelForm";
import ParcelList from "./ParcelList";
import TrackParcel from "./TrackParcel";
import ParcelDetail from "./ParcelDetail";

export default function ParcelRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/track" element={<TrackParcel />} />
      <Route path="/track/:trackingNumber" element={<TrackParcel />} />

      {/* Customer routes */}
      <Route
        path="/create"
        element={
          <ProtectedRoute requiredRole={"CUSTOMER"}>
            <CreateParcelForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-parcels"
        element={
          <ProtectedRoute requiredRole={"CUSTOMER"}>
            <ParcelList />
          </ProtectedRoute>
        }
      />

      {/* Agent routes */}
      <Route
        path="/assigned"
        element={
          <AgentRoute>
            <ParcelList />
          </AgentRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/all"
        element={
          <AdminRoute>
            <ParcelList />
          </AdminRoute>
        }
      />

      {/* Common route */}
      <Route
        path="/:id"
        element={
          <ProtectedRoute>
            <ParcelDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
