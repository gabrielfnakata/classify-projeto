import { Logo } from "@/components/common/logo"
import { SidebarHeader, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function NavHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader className="border-b border-sidebar-border p-3 flex flex-row items-center justify-between group/header relative overflow-hidden">
      <div className={`flex items-center gap-3 shrink-0 ${isCollapsed ? "w-full justify-center" : "w-full justify-around"}`}>
        <Logo variant={isCollapsed ? "small" : "full"} className={isCollapsed ? "w-[7vw] h-10" : "w-[8.5vw] h-11"} />
        {!isCollapsed ? (
          <SidebarTrigger className="ml-auto" />
        ) : null}
      </div>
    </SidebarHeader>
  )
}
