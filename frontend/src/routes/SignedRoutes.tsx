import { BrowserRouter } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Home from "@/pages/home/Home";

export default function SignedRoutes() {
    return (
        <BrowserRouter>
            <ProtectedRoute path='/home' children={<Home/>} />
        </BrowserRouter>
    )
};
