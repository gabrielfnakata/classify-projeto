import {
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { Avatar } from "@/components/common/avatar"
import { ThemeToggle } from "@/components/common/theme-toggle"

const mainItems = [
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

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name="Nome da pessoa" seed="usuario-logado" size="lg" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              Nome da pessoa
            </p>
            <p className="truncate text-xs text-muted-foreground">Cargo</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((section) => (
                <SidebarMenuItem key={section.title}>
                  <SidebarMenuButton tooltip={section.title}>
                    <section.icon />
                    <span>{section.title}</span>
                  </SidebarMenuButton>

                  <SidebarMenuSub>
                    {section.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <a href={item.url} className="block">
                          {item.title}
                        </a>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Acadêmico</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Cursos">
                  <GraduationCap />
                  <span>Cursos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Configurações">
                  <Settings />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex flex-col gap-2 p-2">
          <ThemeToggle />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}