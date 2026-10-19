import { Sidebar, SidebarContent, SidebarFooter, useSidebar } from "@/components/ui/sidebar"
import { NavMain } from "../sidebar/nav-main"
import { NavUser } from "../sidebar/nav-user"
import { NavHeader } from "../sidebar/nav-header"
import { mainNavigation } from "../sidebar/sidebar-items"
import { useAuth } from "@/hooks/useAuth"

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const { userData } = useAuth();
  const isCollapsed = state === "collapsed";
  
  const navigation = mainNavigation
    .filter((group) => !group.allowedRoles || (userData && group.allowedRoles.includes(userData.role)))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.allowedRoles || (userData && item.allowedRoles.includes(userData.role))),
    }))
    .filter((group) => group.items.length > 0 || group.url);

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
          navigation.map((navItem) => {
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
