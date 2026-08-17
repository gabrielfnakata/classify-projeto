import { WEEKDAY_LABELS } from "@/shared/utils/session-analytics"
import { cn } from "@/lib/utils"

interface WeekdayFilterProps {
  value: number[]
  onChange: (value: number[]) => void
  className?: string
}

export function WeekdayFilter({ value, onChange, className }: WeekdayFilterProps) {
  const toggle = (day: number) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day])
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-panel-strong p-1 shadow-sm",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange([])}
        aria-pressed={value.length === 0}
        className={cn(
          "rounded-md px-2 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
          value.length === 0
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        Todos
      </button>

      {WEEKDAY_LABELS.map((label, day) => {
        const active = value.includes(day)

        return (
          <button
            key={label}
            type="button"
            onClick={() => toggle(day)}
            aria-pressed={active}
            className={cn(
              "rounded-md px-2 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
