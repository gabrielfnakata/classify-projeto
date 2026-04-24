import { ChevronRight, type LucideIcon } from "lucide-react"
import { useState, useEffect } from "react"
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
  useSidebar
} from "@/components/ui/sidebar"

interface NavMainProps {
  items: {
    title: string
    icon: LucideIcon
    items?: { title: string; url: string }[]
  }[]
  searchQuery?: string
}

export function NavMain({ items, searchQuery }: NavMainProps) {
  const { state, setOpen } = useSidebar()
  const [openItem, setOpenItem] = useState<string | null>(null)

  useEffect(() => {
    if (state === "collapsed") {
      setOpenItem(null)
    }
  }, [state])

  const handleItemClick = (title: string) => {
    if (state === "collapsed") {
      setOpen(true)
      setOpenItem(title)
    }
  }

  return (
    <SidebarGroup className="pt-0 group-data-[collapsible=icon]:pt-1">
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        Navegação
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible 
              key={item.title} 
              asChild 
              open={searchQuery ? true : openItem === item.title}
              onOpenChange={(isOpen) => {
                setOpenItem(isOpen ? item.title : null)
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    onClick={() => handleItemClick(item.title)}
                    className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:mx-auto"
                  >
                    <div className="flex h-full w-full items-center justify-start group-data-[collapsible=icon]:justify-center">
                      {item.icon && (
                        <item.icon 
                          className="!h-5 !w-5 shrink-0" 
                          strokeWidth={2} 
                        />
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
                        {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                            <a 
                            href={subItem.url} 
                            className="flex h-5.5 w-full items-center rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                            >
                            {subItem.title}
                            </a>
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