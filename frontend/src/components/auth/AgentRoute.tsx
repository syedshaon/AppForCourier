// src/components/auth/AgentRoute.tsx
import type { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";

interface AgentRouteProps {
  children: ReactNode;
}

const AgentRoute = ({ children }: AgentRouteProps) => {
  return <ProtectedRoute requiredRole="AGENT">{children}</ProtectedRoute>;
};

export default AgentRoute;
