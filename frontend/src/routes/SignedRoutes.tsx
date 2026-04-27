import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Components from "@/app/pages/Components";

export default function SignedRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/home" element={
                    <ProtectedRoute children={<Components />} />
                }/>
            </Routes>
        </BrowserRouter>
    )
};
