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
}

export function SegmentedTabs({
  options,
  value,
  onChange,
  className,
}: SegmentedTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex w-full rounded-2xl border border-border bg-panel-strong p-1.5 shadow-sm",
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
              "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
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