import { CalendarDays, LayoutDashboard, Users } from "lucide-react"

export const mainNavigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Visão geral (Admin)", url: "/dashboard/admin" },
      { title: "Painel do Professor", url: "/dashboard/teacher" },
      { title: "Painel do Aluno", url: "/dashboard/student" },
    ],
  },
  {
    title: "Registros",
    icon: Users,
    items: [
      { title: "Alunos", url: "/students" },
      { title: "Funcionários", url: "/employees" },
      { title: "Salas", url: "/classrooms" },
      { title: "Disciplinas", url: "/subjects" },
    ],
  },
  {
    title: "Agenda",
    icon: CalendarDays,
    items: [{ title: "Agendamentos", url: "/schedule" }],
  },
]
