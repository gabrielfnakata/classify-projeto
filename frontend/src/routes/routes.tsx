import Login from "@/pages/login/Login";
import OnDevelopment from "@/pages/on-development/OnDevelopment";
import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Components from "@/app/pages/Components";
import ClassRegistration from "@/pages/classes/ClassRegistration";
import StudentRegistration from "@/pages/students/StudentRegistration";
import EmployeeRegistration from "@/pages/employees/EmployeeRegistration";
import NewEmployee from "@/pages/employees/NewEmployee";
import SubjectRegistration from "@/pages/subjects/SubjectRegistration";
import ClassroomRegistration from "@/pages/classrooms/ClassroomRegistration";
import SchedulePage from "@/pages/schedule";
import { PublicShell } from "@/components/layout/public-shell";
import NewSubject from "@/pages/subjects/NewSubject";
import NewStudent from "@/pages/students/NewStudent";
import NewClassroom from "@/pages/classrooms/NewClassroom";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Login/>}  />
            <Route path="/login" element={<Login/>} />
            <Route path="/forgot-password" element={
                <PublicShell>
                    <OnDevelopment/>
                </PublicShell>
            } />

            {/* Rotas protegidas */}
            <Route path="/components-demo" element={
                <ProtectedRoute children={<Components />} />
            }/>
            <Route path="/classes" element={
                <ProtectedRoute children={<ClassRegistration />} />
            }/>
            <Route path="/new-class-session" element={
                <ProtectedRoute children={<OnDevelopment />} />
            }/>
            <Route path="/students" element={
                <ProtectedRoute children={<StudentRegistration />} />
            }/>
            <Route path="/new-student" element={
                <ProtectedRoute children={<NewStudent />} />
            }/>
            <Route path="/employees" element={
                <ProtectedRoute children={<EmployeeRegistration />} />
            }/>
            <Route path="/new-employee" element={
                <ProtectedRoute children={<NewEmployee />} />
            }/>
            <Route path="/subjects" element={
                <ProtectedRoute children={<SubjectRegistration />} />
            }/>
            <Route path="/new-subject" element={
                <ProtectedRoute children={<NewSubject />} />
            }/>
            <Route path="/classrooms" element={
                <ProtectedRoute children={<ClassroomRegistration />} />
            }/>
            <Route path="/new-classroom" element={
                <ProtectedRoute children={<NewClassroom />} />
            }/>
            <Route path="/scheduling" element={
                <ProtectedRoute children={<SchedulePage />} />
            }/>
        </Routes>
    )
}