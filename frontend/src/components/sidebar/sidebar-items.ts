import { Calendar, File, Home, LayoutDashboard, Users } from "lucide-react"
import type { Group } from "./sidebar-item"
import { Roles } from "@/shared/models/enums/roles"

const adminRoles = [Roles.ADMIN];
const studentRoles = [Roles.ESTUDANTE];
const teachingRoles = [Roles.ADMIN, Roles.PROFESSOR];

export const mainNavigation: Group[] = [
  {
    title: "Início",
    icon: Home,
    items: [
      { title: "Visão do Professor", url: "/home", allowedRoles: teachingRoles },
      { title: "Visão do Aluno", url: "/student-home-page", allowedRoles: studentRoles },
    ],
    url: '/home'
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Visão Geral (Admin)", url: "/dashboard/admin", allowedRoles: adminRoles },
      { title: "Painel do Professor", url: "/dashboard/teacher", allowedRoles: teachingRoles },
      { title: "Meu Desempenho", url: "/dashboard/student", allowedRoles: studentRoles },
    ],
  },
  {
    title: "Registros",
    icon: Users,
    items: [
      { title: "Alunos", url: "/students", allowedRoles: teachingRoles },
      { title: "Funcionários", url: "/employees", allowedRoles: adminRoles },
      { title: "Salas", url: "/classrooms", allowedRoles: adminRoles },
      { title: "Disciplinas", url: "/subjects", allowedRoles: teachingRoles },
      { title: "Turmas", url: "/class-groups", allowedRoles: teachingRoles },
    ],
  },
  {
    title: 'Agenda',
    icon: Calendar,
    items: [
      { title: 'Agendamentos', url: '/schedule', allowedRoles: teachingRoles },
      { title: 'Chamada', url: '/attendance', allowedRoles: teachingRoles }
    ],
    allowedRoles: teachingRoles
  },
  {
    title: 'Relatórios',
    icon: File,
    items: [
      { title: 'Todos os relatórios', url: '/posted-forms', allowedRoles: adminRoles },
      { title: 'Relatório alunos', url: '/pending-forms', allowedRoles: teachingRoles },
      { title: 'Auditoria', url: '/audit-logs', allowedRoles: adminRoles }
    ],
    allowedRoles: adminRoles
  }
]
