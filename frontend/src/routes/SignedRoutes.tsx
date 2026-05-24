import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Components from "@/app/pages/Components";
import Dashboard from "@/pages/dashboard/Dashboard";

export default function SignedRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/home"
          element={<ProtectedRoute children={<Components />} />}
        />

        <Route
          path="/dashboard"
          element={<ProtectedRoute children={<Dashboard userRole="PROFESSOR" />} />}
        />

        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute children={<Dashboard userRole="ADMIN" />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
