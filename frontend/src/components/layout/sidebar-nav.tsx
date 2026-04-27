import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
  Users,
} from "lucide-react"

import { Avatar } from "@/components/common/avatar"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { cn } from "@/lib/utils"

type SidebarItem = {
  label: string
  href?: string
}

type SidebarSection = {
  id: string
  label: string
  icon: LucideIcon
  items: SidebarItem[]
}

const sections: SidebarSection[] = [
  {
    id: "registros",
    label: "Registros",
    icon: Users,
    items: [
      { label: "Alunos" },
      { label: "Funcionários" },
      { label: "Salas" },
      { label: "Disciplinas" },
      { label: "Criar Registro" },
    ],
  },
  {
    id: "agenda",
    label: "Agenda",
    icon: CalendarDays,
    items: [
      { label: "Calendário" },
      { label: "Agendamentos" },
    ],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: ClipboardList,
    items: [
      { label: "Criar relatório" },
      { label: "Todos os relatórios" },
    ],
  },
  {
    id: "conta",
    label: "Conta",
    icon: User,
    items: [
      { label: "Meus dados" },
      { label: "Configurações" },
      { label: "Sair" },
    ],
  },
]

interface SidebarNavProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function SidebarNav({
  collapsed = false,
  onToggleCollapse,
}: SidebarNavProps) {
  const [openSections, setOpenSections] = useState<string[]>([
    "conta",
  ])

  const toggleSection = (sectionId: string) => {
    setOpenSections((current) =>
      current.includes(sectionId)
        ? current.filter((item) => item !== sectionId)
        : [...current, sectionId]
    )
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 self-start border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:block",
        collapsed ? "w-[92px]" : "w-[280px]"
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div
          className={cn(
            "mb-5 flex shrink-0 items-center",
            collapsed ? "justify-center" : "justify-between gap-3"
          )}
        >
          {collapsed ? null : (
            <div className="flex items-center gap-3">
              <Avatar
                name="Nome da pessoa"
                seed="usuario-logado"
                size="lg"
                className="ring-2 ring-background/80"
              />

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-sidebar-foreground">
                  Nome da pessoa
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Cargo
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-xl border border-sidebar-border bg-sidebar-accent p-2 text-sidebar-accent-foreground transition-all duration-200 hover:bg-sidebar-hover hover:shadow-sm"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        {!collapsed ? (
          <nav className="scrollbar-hidden flex-1 space-y-4 overflow-y-auto pr-1">
            {sections.map((section) => {
              const isOpen = openSections.includes(section.id)
              const Icon = section.icon

              return (
                <div key={section.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent px-4 py-3 text-left text-sidebar-accent-foreground transition-all duration-200 hover:bg-sidebar-hover hover:shadow-sm"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{section.label}</span>
                    </span>

                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      isOpen
                        ? "mt-2 grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1 pl-6 pb-1">
                        {section.items.map((item) => {
                          const isLogout = item.label === "Sair"

                          return (
                            <button
                              key={item.label}
                              type="button"
                              className={cn(
                                "block w-full rounded-lg px-3 py-2 text-left text-[15px] transition-colors",
                                isLogout
                                  ? "text-destructive hover:bg-sidebar-hover"
                                  : "text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground"
                              )}
                            >
                              <span className="inline-flex items-center gap-2">
                                {isLogout ? <LogOut className="h-4 w-4" /> : null}
                                {item.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>
        ) : (
          <nav className="scrollbar-hidden flex flex-1 flex-col items-center gap-3 overflow-y-auto pr-1">
            {sections.map((section) => {
              const Icon = section.icon

              return (
                <button
                  key={section.id}
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground transition-all duration-200 hover:bg-sidebar-hover hover:shadow-sm"
                  title={section.label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
          </nav>
        )}

        <div className="mt-4 shrink-0 border-t border-sidebar-border pt-4">
          {!collapsed ? (
            <div className="space-y-2">
              <ThemeToggle />

              <button
                type="button"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent px-4 text-sm font-semibold text-sidebar-accent-foreground transition-colors hover:bg-sidebar-hover"
              >
                <Settings className="h-4 w-4" />
                Preferências
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ThemeToggle collapsed />

              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground transition-colors hover:bg-sidebar-hover"
                title="Preferências"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}