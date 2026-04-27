import { useAuth } from "@/hooks/useAuth"
import PublicRoutes from "./PublicRoutes";
import SignedRoutes from "./SignedRoutes";

export default function AppRoutes() {
    const { signed } = useAuth();

    return signed ? <SignedRoutes/>  : <PublicRoutes/>
}