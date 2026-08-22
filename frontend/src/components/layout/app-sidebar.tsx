import { Sidebar, SidebarContent, SidebarFooter, useSidebar } from "@/components/ui/sidebar"
import { NavMain } from "../sidebar/nav-main"
import { NavUser } from "../sidebar/nav-user"
import { NavHeader } from "../sidebar/nav-header"
import { mainNavigation } from "../sidebar/sidebar-items"

export function AppSidebar() {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      collapsible="icon"
      className="relative sticky top-0 h-svh border-r border-sidebar-border cursor-pointer group-data-[state=expanded]:cursor-default bg-linear-to-t from-sidebar-background to-sidebar-gradient to-85%"
      style={{ "--sidebar-width-icon": "55px" } as React.CSSProperties}
      onClick={() => {
        if (isCollapsed) setOpen(true)
      }}
    >
      <NavHeader />

      <SidebarContent className="scrollbar-hidden">
        { 
          mainNavigation.map((navItem) => {
            return <NavMain key={navItem.title} group={navItem}/>
          }) 
        }
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 flex items-center justify-center min-h-[64px]">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
