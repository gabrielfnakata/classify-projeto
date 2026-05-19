import Login from "@/pages/login/Login";
import OnDevelopment from "@/pages/on-development/OnDevelopment";
import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Components from "@/app/pages/Components";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Login/>}  />
            <Route path="/forgot-password" element={<OnDevelopment/>} />

            {/* Rotas protegidas */}
            <Route path="/home" element={
                <ProtectedRoute children={<Components />} />
            }/>
        </Routes>
    )
}