export interface SubItem {
  title: string
  url: string
}

export interface Group {
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>; 
  items: SubItem[]
}
