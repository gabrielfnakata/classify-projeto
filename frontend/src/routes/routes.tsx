import Login from "@/pages/login/Login";
import OnDevelopment from "@/pages/on-development/OnDevelopment";
import { Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Components from "@/app/pages/Components";
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
import StudentForms from "@/pages/forms/StudentForms";
import TeacherForms from "@/pages/forms/TeacherForms";
import NewForm from "@/pages/forms/NewForm.tsx";
import PreviewForm from "@/pages/forms/PreviewForm.tsx";
import SubmissionForm from "@/pages/forms/AnswerForm.tsx";

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
            <Route path="/classes" element={
                <ProtectedRoute children={<OnDevelopment />} />
            }/>
            <Route path="/account" element={
                <ProtectedRoute children={<OnDevelopment />} />
            }/>
            <Route path="/settings" element={
                <ProtectedRoute children={<OnDevelopment />} />
            }/>
            <Route path="/components-demo" element={
                <ProtectedRoute children={<Components />} />
            }/>
            {/* <Route path="/schedule" element={
                <ProtectedRoute children={<ClassRegistration />} />
            }/> */}
            <Route path="/home" element={
                <ProtectedRoute children={<OnDevelopment />} />
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
            <Route path="/schedule" element={
                <ProtectedRoute children={<SchedulePage />} />
            }/>
            <Route path="/pending-forms" element={
                <ProtectedRoute children={<StudentForms />} />
            }/>
            <Route path="/posted-forms" element={
                <ProtectedRoute children={<TeacherForms />} />
            }/>
            <Route path="/new-form" element={
                <ProtectedRoute children={<NewForm />} />
            }/>
            <Route path="/form-preview" element={
                <ProtectedRoute children={<PreviewForm />} />
            }/>
            <Route path="/form-preview/:id" element={
                <ProtectedRoute children={<PreviewForm />} />
            }/>
            <Route path="/submission-form/:uuid" element={
                <ProtectedRoute children={<SubmissionForm />} />
            }/>
        </Routes>
    )
}
