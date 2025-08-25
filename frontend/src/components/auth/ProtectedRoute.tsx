// src/components/auth/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "ADMIN" | "AGENT" | "CUSTOMER";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "AGENT") {
      return <Navigate to="/agent" replace />;
    } else if (user?.role === "CUSTOMER") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
