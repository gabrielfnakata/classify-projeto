import { cn } from "@/lib/utils"

interface InitialsAvatarProps {
  name: string
  className?: string
}

const PALETTE = [
  "bg-primary/15 text-primary",
  "bg-info/20 text-info-foreground",
  "bg-warning/20 text-warning-foreground",
  "bg-success/20 text-success-foreground",
]

function paletteIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return hash % PALETTE.length
}

export function InitialsAvatar({ name, className }: InitialsAvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        PALETTE[paletteIndex(name)],
        className
      )}
    >
      {initials}
    </div>
  )
}
