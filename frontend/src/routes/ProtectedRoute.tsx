import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { Roles } from "@/shared/models/enums/roles";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Roles[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { signed, loading, userData } = useAuth();
  if (loading) return null;
  if (!signed) return <Navigate to="/" />

  if (allowedRoles && !allowedRoles.includes(userData?.role as Roles)) {
    const homeRoute = (userData?.role === Roles.ESTUDANTE)
      ? "/student-home-page"
      : (userData?.role === Roles.ADMIN || userData?.role === Roles.PROFESSOR)
        ? "/home"
        : "/";
        
    return <Navigate to={homeRoute} replace />;
  }
  return (
    <AppShell>
      {children}
    </AppShell>
  );
} 