// import type { ReactNode } from "react"

// import { AppSidebar } from "@/components/layout/app-sidebar"
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar"
// import { TooltipProvider } from "@/components/ui/tooltip"

// interface AppShellProps {
//   children: ReactNode
// }

// export function AppShell({ children }: AppShellProps) {
//   return (
//     <SidebarProvider>
//       <TooltipProvider delayDuration={0}>
//         <AppSidebar />

//         <SidebarInset>
//           <div className="min-h-svh bg-background text-foreground transition-colors">
//             <div className="flex items-center gap-2 border-b border-border px-4 py-3">
//               <SidebarTrigger />
//               <span className="text-sm font-medium text-muted-foreground">
//                 Classify
//               </span>
//             </div>

//             <main className="p-6 md:p-8">
//               <div className="mx-auto max-w-7xl">{children}</div>
//             </main>
//           </div>
//         </SidebarInset>
//       </TooltipProvider>
//     </SidebarProvider>
//   )
// }


import { useState } from "react"
import type { ReactNode } from "react"
import { SidebarNav } from "@/components/layout/sidebar-nav"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-svh bg-background text-foreground transition-colors">
      <div className="flex min-h-svh">
        <SidebarNav
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />

        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}