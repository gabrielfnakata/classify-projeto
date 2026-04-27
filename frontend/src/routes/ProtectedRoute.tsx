import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

// TODO: Incluir as roles de autenticação
interface ProtectedRouteProps {
// allowedRoles: [];
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { signed } = useAuth();
  if (!signed) return <Navigate to="/" />
  return (children);
} 