import Login from "@/pages/login/Login";
import { BrowserRouter, Route, Routes } from "react-router";

export default function PublicRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}  />
            </Routes>
        </BrowserRouter>
    );
}