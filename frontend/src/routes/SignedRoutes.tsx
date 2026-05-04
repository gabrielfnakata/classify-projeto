import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Components from "@/app/pages/Components";
import ClassRegistration from "@/pages/classes/ClassRegistration";
import OnDevelopment from "@/pages/on-development/OnDevelopment";

export default function SignedRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/components-demo" element={
                    <ProtectedRoute children={<Components />} />
                }/>
                <Route path="/classes" element={
                    <ProtectedRoute children={<ClassRegistration />} />
                }/>
                <Route path="/new-class-session" element={
                    <ProtectedRoute children={<OnDevelopment />} />
                }/>
            </Routes>
        </BrowserRouter>
    )
};
