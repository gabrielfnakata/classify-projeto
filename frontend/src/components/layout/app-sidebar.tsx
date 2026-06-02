import { useState, useMemo } from "react"
import { Sidebar, SidebarContent, SidebarFooter, useSidebar } from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { NavHeader } from "./nav-header"
import { NavSearch } from "./nav-search"
import { mainNavigation } from "./sidebar-items"

export function AppSidebar() {
  const { state } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const isCollapsed = state === "collapsed"

  const filteredNavigation = useMemo(() => {
    if (!searchQuery) return mainNavigation

    const query = searchQuery.toLowerCase()

    return mainNavigation
      .map((group) => {
        const filteredSubItems = group.items?.filter((sub) =>
          sub.title.toLowerCase().includes(query)
        )
        if (!filteredSubItems?.length) return null
        return { ...group, items: filteredSubItems }
      })
      .filter(Boolean) as typeof mainNavigation
  }, [searchQuery])

  return (
    <Sidebar
      collapsible="icon"
      className="relative sticky top-0 h-svh border-r border-sidebar-border"
      style={{ "--sidebar-width-icon": "55px" } as React.CSSProperties}
    >
      <NavHeader />

      <SidebarContent className="scrollbar-hidden">
        <NavSearch value={searchQuery} onChange={setSearchQuery} />
        <NavMain items={filteredNavigation} searchQuery={searchQuery} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 flex items-center justify-center min-h-[64px]">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
