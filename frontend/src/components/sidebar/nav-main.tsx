import { Link } from "react-router"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import type { Group } from "./sidebar-item"
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

export function NavMain( {group}: { group: Group } ) {
  const hasItems = Boolean(group.items && group.items.length);

  const groupIcon = group.icon && (
    <group.icon className="!h-5 !w-5 shrink-0"/>
  );
  
  // TODO: Link para os que não possuem subitem
  if (!hasItems) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-2 first:pt-2 group-data-[collapsible=icon]:first:pt-4">
        <div className="flex h-full w-full px-2 py-3 items-center justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:mx-auto hover:bg-sidebar-accent rounded-md transition-colors">
          <SidebarGroupLabel className="flex gap-3 cursor-pointer text-base">
            {groupIcon}
            <span className="group-data-[collapsible=icon]:hidden">
              {group.title}
            </span>
          </SidebarGroupLabel>
        </div>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible defaultOpen={false} className="group/collapsible">
      <SidebarGroup className="group-data-[collapsible=icon]:p-2">
        <CollapsibleTrigger asChild className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:mx-auto">
          <div className="flex h-full w-full px-2 py-3 items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 hover:bg-sidebar-accent rounded-md">
            <SidebarGroupLabel className="flex gap-3 cursor-pointer text-base">
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
            <SidebarMenu className="ml-6 flex flex-col gap-3 border-l border-sidebar-border">
              {group.items.map((item, index) => (
                <SidebarMenuItem
                  key={item.url}
                  className="animate-in fade-in-0 slide-in-from-top-2 duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                >
                  <Link to={item.url}>
                    <span className="flex h-5.5 w-full items-center rounded-md p-2 text-sm">
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

    // <SidebarGroup className="pt-0 group-data-[collapsible=icon]:pt-1">
    //   <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
    //     Navegação
    //   </SidebarGroupLabel>
    //   <SidebarGroupContent>
    //     <SidebarMenu>
    //       {groups.map((item, index) => (
    //         <Collapsible
    //           key={item.title}
    //           asChild
    //           open={searchQuery ? true : openItems.includes(item.title)}
    //           onOpenChange={(isOpen) => {
    //             setOpenItems((prev) =>
    //               isOpen ? [...prev, item.title] : prev.filter((t) => t !== item.title)
    //             )
    //           }}
    //           className="group/collapsible"
    //         >
    //           <SidebarMenuItem
    //             className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center animate-in fade-in-0 slide-in-from-top-2 duration-200"
    //             style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    //           >
    //             <CollapsibleTrigger asChild>
    //               <SidebarMenuButton
    //                 tooltip={item.title}
    //                 onClick={handleItemClick}
    //                 className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:mx-auto"
    //               >
    //                 <div className="flex h-full w-full items-center justify-start group-data-[collapsible=icon]:justify-center">
    //                   {item.icon && (
    //                     <item.icon className="!h-5 !w-5 shrink-0" strokeWidth={2} />
    //                   )}
    //                   <span className="text-base ml-3 group-data-[collapsible=icon]:hidden">
    //                     {item.title}
    //                   </span>
    //                   { item.items.length ? 
    //                     state === 'expanded' ?
    //                     <ChevronDown className="ml-auto"/>
    //                     : <ChevronRight className="ml-auto" />
    //                     : null
    //                   }
    //                 </div>
    //               </SidebarMenuButton>
    //             </CollapsibleTrigger>
    //             <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
    //               <SidebarMenuSub className="ml-[1.15rem] flex flex-col gap-0 border-l border-sidebar-border">
    //                 {item.items.length ? 
    //                 item.items?.filter(sub => sub.url !== null).map((subItem) => (
    //                   <SidebarMenuSubItem key={subItem.title}>
    //                     <Link
    //                       to={subItem.url!}
    //                       className="flex h-5.5 w-full items-center rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
    //                     >
    //                       {subItem.title}
    //                     </Link>
    //                   </SidebarMenuSubItem>
    //                 )
    //               ) : null}
    //               </SidebarMenuSub>
    //             </CollapsibleContent>
    //           </SidebarMenuItem>
    //         </Collapsible>
    //       ))}
    //     </SidebarMenu>
    //   </SidebarGroupContent>
    // </SidebarGroup>
}
