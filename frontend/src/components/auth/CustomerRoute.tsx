// src/components/auth/CustomerRoute.tsx
import type { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";

interface CustomerRouteProps {
  children: ReactNode;
}

const CustomerRoute = ({ children }: CustomerRouteProps) => {
  return <ProtectedRoute requiredRole="CUSTOMER">{children}</ProtectedRoute>;
};

export default CustomerRoute;
