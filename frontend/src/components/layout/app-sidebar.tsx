import { useState, useMemo } from "react"
import { Sidebar, SidebarContent, SidebarFooter, useSidebar } from "@/components/ui/sidebar"
import { NavMain } from "../navbar/nav-main"
import { NavUser } from "../navbar/nav-user"
import { NavHeader } from "../navbar/nav-header"
import { NavSearch } from "../navbar/nav-search"
import { mainNavigation } from "@/constants/navigation"

export function AppSidebar() {
  const { state, setOpen } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const isCollapsed = state === "collapsed"

  const filteredNavigation = useMemo(() => {
    if (!searchQuery) return mainNavigation

    const normalize = (text: string) => 
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

    const query = normalize(searchQuery)

    return mainNavigation
      .map((group) => {
        const groupTitle = normalize(group.title)
        const matchesGroup = groupTitle.includes(query)

        const filteredSubItems = group.items?.filter((sub) => {
          const subTitle = normalize(sub.title)
          return subTitle.includes(query)
        })

        if (matchesGroup || (filteredSubItems && filteredSubItems.length > 0)) {
          return {
            ...group,
            items: filteredSubItems,
          }
        }
        return null
      })
      .filter(Boolean) as typeof mainNavigation
  }, [searchQuery])

  return (
    <Sidebar 
      collapsible="icon" 
      className="relative sticky top-0 h-svh border-r border-sidebar-border cursor-pointer group-data-[state=expanded]:cursor-default"
      style={{ "--sidebar-width-icon": "55px" } as React.CSSProperties}
      onClick={() => {
        if (isCollapsed) setOpen(true)
      }}
    >
      <NavHeader />

      <SidebarContent className="scrollbar-hidden">
        <NavSearch value={searchQuery} onChange={setSearchQuery} />
        <NavMain items={filteredNavigation} searchQuery={searchQuery} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 flex items-center justify-center min-h-[64px]">
        <NavUser isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  )
}