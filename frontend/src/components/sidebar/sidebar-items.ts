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
    items: [],
    url: '/home'
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Painel do Professor", url: "/dashboard/teacher", allowedRoles: adminRoles },
      { title: "Painel do Aluno", url: "/dashboard/student", allowedRoles: adminRoles },
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
      { title: 'Meus agendamentos', url: '/schedule', allowedRoles: studentRoles },
      { title: 'Chamada', url: '/attendance', allowedRoles: teachingRoles }
    ],
  },
  {
    title: 'Relatórios',
    icon: File,
    items: [
      { title: 'Todos os relatórios', url: '/posted-forms', allowedRoles: adminRoles },
      { title: 'Meus formulários', url: '/posted-forms', allowedRoles: [Roles.PROFESSOR] },
      { title: 'Meus formulários', url: '/pending-forms', allowedRoles: studentRoles },
      { title: 'Auditoria', url: '/audit-logs', allowedRoles: adminRoles }
    ],
  }
]
