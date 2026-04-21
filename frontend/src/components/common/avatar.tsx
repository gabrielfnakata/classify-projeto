import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md" | "lg" | "xl"

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  seed?: string | number
  size?: AvatarSize
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
}

//color classes de cores bonitinhas
const colorClasses = [
  "bg-[#F8E8A8] text-[#8A6A16] border-[#EFD98A] dark:bg-[#4C4122] dark:text-[#F8E8A8] dark:border-[#6A5930]",
  "bg-[#F7D9D9] text-[#8A4A4A] border-[#EDC3C3] dark:bg-[#4D3030] dark:text-[#F7D9D9] dark:border-[#6B4444]",
  "bg-[#F9E3D2] text-[#8A5C3B] border-[#F1D0B7] dark:bg-[#4F3728] dark:text-[#F9E3D2] dark:border-[#6C4B38]",
  "bg-[#DCEFD9] text-[#4F7A4A] border-[#C7E4C3] dark:bg-[#2F4630] dark:text-[#DCEFD9] dark:border-[#456346]",
  "bg-[#DCEAF7] text-[#4A678A] border-[#C6DAEF] dark:bg-[#2D3F54] dark:text-[#DCEAF7] dark:border-[#435C79]",
  "bg-[#E6DDF7] text-[#62508A] border-[#D7CAF0] dark:bg-[#3A3154] dark:text-[#E6DDF7] dark:border-[#534872]",
  "bg-[#F5DDED] text-[#8A5373] border-[#ECC9DE] dark:bg-[#4A3142] dark:text-[#F5DDED] dark:border-[#69465D]",
  "bg-[#EAEAEA] text-[#666666] border-[#D9D9D9] dark:bg-[#3C3C3C] dark:text-[#EAEAEA] dark:border-[#575757]",
]

//color classes da cor do tema 
// const colorClasses = [
//   "bg-primary/15 text-primary",
//   "bg-accent text-accent-foreground",
//   "bg-secondary text-secondary-foreground",
//   "bg-info/15 text-info-foreground",
//   "bg-success/15 text-success-foreground",
//   "bg-warning/18 text-warning-foreground",
//   "bg-muted text-foreground",
// ]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

function getColorIndex(value: string) {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }

  return Math.abs(hash) % colorClasses.length
}

export function Avatar({
  name,
  seed,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const initials = getInitials(name)
  const baseValue = String(seed ?? name)
  const colorClass = colorClasses[getColorIndex(baseValue)]

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border font-semibold select-none",
        sizeClasses[size],
        colorClass,
        className
      )}
      aria-label={name}
      title={name}
      {...props}
    >
      {initials}
    </div>
  )
}