import { SidebarHeader, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function NavHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader className="border-b border-sidebar-border p-3 flex flex-row items-center justify-between group/header relative overflow-hidden">
      <div className={`flex items-center gap-3 shrink-0 ${isCollapsed ? "w-full justify-center" : ""}`}>
        <img
          src={isCollapsed ? "/small logo.svg" : "/dark logo.svg"}
          alt="Classify Logo"
          className={`w-[7vw] h-10 object-contain block`}
        />
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
