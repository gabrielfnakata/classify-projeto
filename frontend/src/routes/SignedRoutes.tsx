import { BrowserRouter, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Home from "@/pages/home/Home";

export default function SignedRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <ProtectedRoute path='/home' children={<Home/>} />
            </Routes>
        </BrowserRouter>
    )
};
