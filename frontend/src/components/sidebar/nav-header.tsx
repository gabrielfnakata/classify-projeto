import { SidebarHeader, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function NavHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader className="border-b border-sidebar-border p-3 flex flex-row items-center justify-between group/header relative overflow-hidden">
      <div className={`flex items-center gap-3 shrink-0 ${isCollapsed ? "w-full justify-center" : "w-full justify-around"}`}>
        <img
          src={isCollapsed ? "/small logo.svg" : "/dark logo.svg"}
          alt="Classify Logo"
          className={`w-[7vw] h-10 object-contain block`}
        />
        {!isCollapsed ? (
          <SidebarTrigger className="ml-auto" />
        ) : null}
      </div>
    </SidebarHeader>
  )
}
