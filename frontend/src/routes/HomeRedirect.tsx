import { Navigate } from "react-router";

import { useAuth } from "@/hooks/useAuth";
import { homeRouteFor } from "@/shared/utils/home-route";

export function HomeRedirect() {
  const { userData } = useAuth();
  return <Navigate to={homeRouteFor(userData?.role)} replace />;
}
