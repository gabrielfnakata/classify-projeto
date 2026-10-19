import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Roles } from "@/shared/models/enums/roles";
import NoAllowedRole from "@/pages/no-allowed-role/NoAllowedRole";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Roles[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { signed, loading, userData } = useAuth();
  const location = useLocation();
  if (loading)
    return null;

  if (!signed)
    return (<Navigate to="/login" replace state={{ from: location.pathname + location.search }} />);

  if (allowedRoles && !allowedRoles.includes(userData?.role as Roles))
    return (<NoAllowedRole />);

  return (
    <AppShell>
      {children}
    </AppShell>
  );
};