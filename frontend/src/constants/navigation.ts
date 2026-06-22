import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Users,
} from "lucide-react"

export const mainNavigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [{ title: "Visão geral", url: "#" }],
  },
  {
    title: "Registros",
    icon: Users,
    items: [
      { title: "Alunos", url: "#" },
      { title: "Funcionários", url: "#" },
      { title: "Salas", url: "#" },
      { title: "Disciplinas", url: "#" },
      { title: "Criar registro", url: "#" },
    ],
  },
  {
    title: "Agenda",
    icon: CalendarDays,
    items: [
      { title: "Calendário", url: "#" },
      { title: "Agendamentos", url: "#" },
    ],
  },
  {
    title: "Relatórios",
    icon: ClipboardList,
    items: [
      { title: "Criar relatório", url: "#" },
      { title: "Todos os relatórios", url: "#" },
    ],
  },
  {
    title: "Documentos",
    icon: FileText,
    items: [
      { title: "Arquivos", url: "#" },
      { title: "Modelos", url: "#" },
    ],
  },
]