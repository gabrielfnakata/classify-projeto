import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import OnDevelopment from "@/pages/on-development/OnDevelopment";

export default function SignedRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/home" element={
                    <ProtectedRoute children={<OnDevelopment/>} />
                }/>
            </Routes>
        </BrowserRouter>
    )
};
