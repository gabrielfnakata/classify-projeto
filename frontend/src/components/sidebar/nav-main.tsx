import { Link } from "react-router"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import type { Group } from "./sidebar-item"
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useState } from "react";

export function NavMain( {group}: { group: Group } ) {
  const hasItems = Boolean(group.items && group.items.length);
  const {state} = useSidebar();
  const [open, setOpen] = useState(false);

  const groupIcon = group.icon && (
    <group.icon className="!h-5 !w-5 shrink-0"/>
  );
  
  if (!hasItems) {
    return (
      <Link to={group.url!}>
        <SidebarGroup className="group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-2 first:pt-2 group-data-[collapsible=icon]:first:pt-4">
          <div className="flex h-full w-full px-2 py-3  cursor-pointer items-center justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:mx-auto hover:bg-sidebar-secondary rounded-md transition-colors">
            <SidebarGroupLabel className="flex gap-3 text-base text-sidebar-primary font-bold">
              {groupIcon}
              <span className="group-data-[collapsible=icon]:hidden">
                {group.title}
              </span>
            </SidebarGroupLabel>
          </div>
        </SidebarGroup>
      </Link>
    );
  }

  return (
    <Collapsible open={state === 'collapsed' ? false : open} defaultOpen={false} onOpenChange={() => setOpen(!open)} className="group/collapsible">
      <SidebarGroup className="group-data-[collapsible=icon]:p-2">
        <CollapsibleTrigger asChild className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:mx-auto">
          <div className="flex h-full w-full px-2 py-3 cursor-pointer items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 hover:bg-sidebar-secondary rounded-md transition-colors">
            <SidebarGroupLabel className="flex gap-3 text-base text-sidebar-primary font-bold">
              {groupIcon}
              <span className="group-data-[collapsible=icon]:hidden">
                {group.title}
              </span>
            </SidebarGroupLabel>
            <SidebarGroupAction>
              <ChevronDown className="transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
            </SidebarGroupAction>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarGroupContent>
            <SidebarMenu className="ml-6 flex flex-col gap-1 border-l border-sidebar-border">
              {group.items.map((item, index) => (
                <SidebarMenuItem
                  key={item.url}
                  className="animate-in fade-in-0 slide-in-from-top-2 duration-200 hover:bg-sidebar-secondary hover:text-sidebar-foreground transition-colors rounded-sm"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                >
                  <Link to={item.url}>
                    <span className="flex h-5.5 w-full items-center rounded-md p-2 text-sm text-sidebar-primary">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
