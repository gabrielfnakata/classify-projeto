import Login from "@/pages/login/Login";
import { BrowserRouter, Route } from "react-router";

export default function PublicRoutes() {
    return (
        <BrowserRouter>
            <Route path="/" element={<Login/>}  />
        </BrowserRouter>
    );
}