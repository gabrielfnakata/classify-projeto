import type { ReactNode } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AppShellProps {
  children: ReactNode
}

function ShellContent({ children }: AppShellProps) {
  const { state } = useSidebar();
  
  return (
    <div className="min-h-svh bg-background text-foreground transition-colors">
      <main className="flex-y overflow-y-auto">
          <div className={`mx-auto ${state === 'collapsed' ? 'w-[calc(100vw-92px)]' : 'w-[calc(100vw-280px)]'} h-screen`}>
            {children}
          </div>
      </main>
    </div>
  )
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <TooltipProvider delayDuration={0}>
        <AppSidebar />
        <SidebarInset>
          <ShellContent>{children}</ShellContent>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}