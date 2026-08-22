import { Calendar, File, Home, Users } from "lucide-react"
import type { Group } from "./sidebar-item"

export const mainNavigation: Group[] = [
  {
    title: "Início",
    icon: Home,
    items: [],
    url: '/home'
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
    title: 'Agenda',
    icon: Calendar,
    items: [
      { title: 'Calendário', url: '/schedule' },
      { title: 'Agendamentos', url: '/schedule' }
    ]
  },
  {
    title: 'Relatórios',
    icon: File,
    items: [
      { title: 'Criar relatório', url: '/home' },
      { title: 'Todos os relatórios', url: '/home' }
    ]
  }
]