import { useAuth } from "@/hooks/useAuth"
import PublicRoutes from "./PublicRoutes";
import SignedRoutes from "./SignedRoutes";

export default function Routes() {
    const { signed } = useAuth();

    return signed ? <SignedRoutes/>  : <PublicRoutes/>
}