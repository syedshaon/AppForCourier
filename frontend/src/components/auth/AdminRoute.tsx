// src/components/auth/AdminRoute.tsx
import type { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  return <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>;
};

export default AdminRoute;
