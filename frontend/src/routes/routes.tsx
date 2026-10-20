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
import AuditLogs from "@/pages/audit/AuditLogs";
import StudentForms from "@/pages/forms/StudentForms";
import TeacherForms from "@/pages/forms/TeacherForms";
import NewForm from "@/pages/forms/NewForm.tsx";
import PreviewForm from "@/pages/forms/PreviewForm.tsx";
import SubmissionForm from "@/pages/forms/SubmissionForm.tsx";
import AttendancePage from "@/pages/attendance";
import AttendanceOverview from "@/pages/attendance/AttendanceOverview";
import AttendanceSeriesPage from "@/pages/attendance/AttendanceSeries";
import ClassGroupRegistration from "@/pages/class-groups/ClassGroupRegistration";
import NewClassGroup from "@/pages/class-groups/NewClassGroup";
import ClassGroupDetail from "@/pages/class-groups/ClassGroupDetail";
import FormAnswers from "@/pages/forms/FormAnswers.tsx";
import FormCorrection from "@/pages/forms/FormCorrection";
import StudentDetail from "@/pages/students/StudentDetail";
import EmployeeDetail from "@/pages/employees/EmployeeDetail";
import SubjectDetail from "@/pages/subjects/SubjectDetail";
import ClassroomDetail from "@/pages/classrooms/ClassroomDetail";
import StudentHomePage from "@/pages/student-home-page/StudentHomePage";
import ProfilePage from "@/pages/profile/ProfilePage";
import { Roles } from "@/shared/models/enums/roles";
import DeletedEntities from "@/pages/deleted-entities/DeletedEntities.tsx";

const adminRoles = [Roles.ADMIN];
const studentRoles = [Roles.ESTUDANTE];
const teachingRoles = [Roles.ADMIN, Roles.PROFESSOR];

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

            {/* Rotas protegidas para estudantes */}
            <Route path="/student-home-page" element={
                <ProtectedRoute allowedRoles={studentRoles} children={<StudentHomePage />} />
            }/>

            {/* Rotas protegidas para professores*/}
            <Route path="/classes" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<OnDevelopment />} />
            }/>
            <Route path="/components-demo" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<Components />} />
            }/>
            {/* <Route path="/schedule" element={
                <ProtectedRoute children={<ClassRegistration />} />
            }/> */}
            <Route path="/home" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<OnDevelopment />} />
            }/>
            <Route path="/new-class-session" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<OnDevelopment />} />
            }/>
            <Route path="/students" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<StudentRegistration />} />
            }/>
            <Route path="/employees/:uuid" element={
                <ProtectedRoute children={<EmployeeDetail />} />
            }/>
            <Route path="/students/:uuid" element={
                <ProtectedRoute children={<StudentDetail />} />
            }/>
            <Route path="/subjects" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<SubjectRegistration />} />
            }/>
            <Route path="/new-subject" element={
                <ProtectedRoute children={<NewSubject />} />
            }/>
            <Route path="/subjects/:uuid" element={
                <ProtectedRoute children={<SubjectDetail />} />
            }/>
            <Route path="/classrooms" element={
                <ProtectedRoute children={<ClassroomRegistration />} />
            }/>
            <Route path="/new-classroom" element={
                <ProtectedRoute children={<NewClassroom />} />
            }/>
            <Route path="/classrooms/:uuid" element={
                <ProtectedRoute children={<ClassroomDetail />} />
            }/>
            <Route path="/schedule" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<SchedulePage />} />
            }/>
            <Route path="/attendance" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<AttendanceOverview />} />
            }/>
            <Route path="/attendance/series/:recurrenceUuid" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<AttendanceSeriesPage />} />
            }/>
            <Route path="/attendance/:sessionUuid" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<AttendancePage />} />
            }/>
            <Route path="/class-groups" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<ClassGroupRegistration />} />
            }/>
            <Route path="/new-class-group" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<NewClassGroup />} />
            }/>
            <Route path="/class-groups/:uuid" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<ClassGroupDetail />} />
            }/>
            <Route path="/pending-forms" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<StudentForms />} />
            }/>
            <Route path="/posted-forms" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<TeacherForms />} />
            }/>
            <Route path="/new-form" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<NewForm />} />
            }/>
            <Route path="/form-preview" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<PreviewForm />} />
            }/>
            <Route path="/form-preview/:id" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<PreviewForm />} />
            }/>
            <Route path="/form-answers/:id" element={
                <ProtectedRoute allowedRoles={teachingRoles} children={<FormAnswers />} />
            }/>
            <Route path="/form-answers/:id/:submissionId" element={
               <ProtectedRoute allowedRoles={teachingRoles} children={<FormCorrection />} />
            }/>

            {/* Rotas protegidas para administradores */}
            <Route path="/new-student" element={
                <ProtectedRoute allowedRoles={adminRoles} children={<NewStudent />} />
            }/>
            <Route path="/employees" element={
                <ProtectedRoute allowedRoles={adminRoles} children={<EmployeeRegistration />} />
            }/>
            <Route path="/new-employee" element={
                <ProtectedRoute allowedRoles={adminRoles} children={<NewEmployee />} />
            }/>
            <Route path="/new-subject" element={
                <ProtectedRoute allowedRoles={adminRoles} children={<NewSubject />} />
            }/>
            <Route path="/classrooms" element={
                <ProtectedRoute allowedRoles={adminRoles} children={<ClassroomRegistration />} />
            }/>
            <Route path="/new-classroom" element={
                <ProtectedRoute allowedRoles={adminRoles} children={<NewClassroom />} />
            }/>
            <Route path="/components-demo" element={
                <ProtectedRoute allowedRoles={adminRoles} children={<Components />} />
            }/>
            <Route path="/audit-logs" element={
                <ProtectedRoute allowedRoles={adminRoles} children={<AuditLogs />} />
            }/>

            <Route path="/deleted-entities" element={
               <ProtectedRoute allowedRoles={adminRoles} children={<DeletedEntities />} />
            }/>

            {/* Rotas para todos os usuários autenticados */}
            <Route path="/account" element={
                <ProtectedRoute children={<ProfilePage />} />
            }/>
            <Route path="/settings" element={
                <ProtectedRoute children={<OnDevelopment />} />
            }/>
            {/* <Route path="/schedule" element={
                <ProtectedRoute children={<ClassRegistration />} />
            }/> */}
            <Route path="/submission-form/:formUuid/:submissionUuid" element={
                <ProtectedRoute children={<SubmissionForm />} />
            }/>
        </Routes>
    );
}
