import { CalendarDays, LayoutDashboard, Users } from "lucide-react"

export const mainNavigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [{ title: "Visão geral", url: "/classes" }],
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
