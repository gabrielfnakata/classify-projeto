import Login from "@/pages/login/Login";
import OnDevelopment from "@/pages/on-development/OnDevelopment";
import { BrowserRouter, Route, Routes } from "react-router";

export default function PublicRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}  />
                <Route path="/forgot-password" element={<OnDevelopment/>} />
            </Routes>
        </BrowserRouter>
    );
}