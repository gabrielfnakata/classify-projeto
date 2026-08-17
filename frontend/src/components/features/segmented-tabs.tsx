import { cn } from "@/lib/utils"

export type SegmentedTabOption = {
  label: string
  value: string
}

interface SegmentedTabsProps {
  options: SegmentedTabOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  size?: "default" | "sm"
}

const containerSizeClasses: Record<"default" | "sm", string> = {
  default: "rounded-2xl p-1.5",
  sm: "rounded-lg p-1",
}

const buttonSizeClasses: Record<"default" | "sm", string> = {
  default: "rounded-xl px-4 py-3 text-sm",
  sm: "rounded-md px-2.5 py-1.5 text-xs",
}

export function SegmentedTabs({
  options,
  value,
  onChange,
  className,
  size = "default",
}: SegmentedTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex w-full items-center border border-border bg-panel-strong shadow-sm",
        containerSizeClasses[size],
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "min-w-0 flex-1 truncate font-semibold whitespace-nowrap transition-colors",
              buttonSizeClasses[size],
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}