import { SidebarHeader, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import logoImg from "@/assets/Logo.png"

export function NavHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader className="border-b border-sidebar-border p-3 flex flex-row items-center justify-between group/header relative overflow-hidden">
      <div className={`flex items-center gap-3 shrink-0 ${isCollapsed ? "w-full justify-center" : ""}`}>
        <img 
          src={logoImg} 
          alt="Classify Logo" 
          className={`${isCollapsed ? "h-9 w-9" : "h-10 w-10"} object-contain block`}
        />
        {!isCollapsed && (
          <span className="font-bold text-xl tracking-tight text-sidebar-foreground">
            Classify
          </span>
        )}
      </div>

      {!isCollapsed ? (
        <SidebarTrigger className="ml-auto" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/header:opacity-100 transition-all bg-sidebar/95 backdrop-blur-sm">
          <SidebarTrigger className="scale-110" />
        </div>
      )}
    </SidebarHeader>
  )
}