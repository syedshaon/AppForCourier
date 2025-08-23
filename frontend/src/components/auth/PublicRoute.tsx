// src/components/auth/PublicRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard
    const redirectPath = user?.role === "ADMIN" ? "/admin" : user?.role === "AGENT" ? "/agent" : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
