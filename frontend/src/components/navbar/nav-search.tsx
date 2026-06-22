import { Search } from "lucide-react"
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  useSidebar 
} from "@/components/ui/sidebar"

interface NavSearchProps {
  value: string
  onChange: (value: string) => void
}

export function NavSearch({ value, onChange }: NavSearchProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  if (isCollapsed) return null

  return (
    <SidebarGroup className="pt-4 pb-0">
      <SidebarGroupContent>
        <div className="relative flex items-center px-2">
          <div className="relative w-full group">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-sidebar-foreground transition-colors" />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Buscar"
              className="h-9 w-full rounded-md border border-sidebar-border bg-sidebar-accent/50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-sidebar-ring transition-all"
            />
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}