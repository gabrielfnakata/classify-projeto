import type { ReactNode } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-svh bg-background text-foreground transition-colors">
            <main className="p-6 md:p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}