import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";
import { Navigate, Route } from "react-router";

// TODO: Incluir as roles de autenticação
interface ProtectedRouteProps {
// allowedRoles: [];
  children: ReactNode;
  path: string;
}

export const ProtectedRoute = ({ children, path }: ProtectedRouteProps) => {
  const { signed } = useAuth();
  if (!signed) return <Navigate to="/" />
  return <Route path={path} children={children} />;
} 