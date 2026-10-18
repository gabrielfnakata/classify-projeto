import type { Roles } from "@/shared/models/enums/roles"

export interface SubItem {
  title: string
  url: string
  allowedRoles?: Roles[]
}

export interface Group {
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>; 
  items: SubItem[]
  url?: string;
  allowedRoles?: Roles[]
}
