import { ChevronRight, type LucideIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router"
import type { NavGroupDTO } from "@/shared/dtos/navigation/NavItemDTO"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface NavMainProps {
  items: (NavGroupDTO & { icon: LucideIcon })[]
  searchQuery?: string
}

export function NavMain({ items, searchQuery }: NavMainProps) {
  const { state, setOpen } = useSidebar()
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    if (state === "collapsed") {
      setOpenItems([])
    } else {
      setOpenItems(items.map((item) => item.title))
    }
  }, [state, items])

  const handleItemClick = () => {
    if (state === "collapsed") setOpen(true)
  }

  return (
    <SidebarGroup className="pt-0 group-data-[collapsible=icon]:pt-1">
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        Navegação
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item, index) => (
            <Collapsible
              key={item.title}
              asChild
              open={searchQuery ? true : openItems.includes(item.title)}
              onOpenChange={(isOpen) => {
                setOpenItems((prev) =>
                  isOpen ? [...prev, item.title] : prev.filter((t) => t !== item.title)
                )
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem
                className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center animate-in fade-in-0 slide-in-from-top-2 duration-200"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={handleItemClick}
                    className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:mx-auto"
                  >
                    <div className="flex h-full w-full items-center justify-start group-data-[collapsible=icon]:justify-center">
                      {item.icon && (
                        <item.icon className="!h-5 !w-5 shrink-0" strokeWidth={2} />
                      )}
                      <span className="text-base ml-3 group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <SidebarMenuSub className="ml-[1.15rem] flex flex-col gap-0 border-l border-sidebar-border">
                    {item.items?.filter(sub => sub.url !== null).map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <Link
                          to={subItem.url!}
                          className="flex h-5.5 w-full items-center rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        >
                          {subItem.title}
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
