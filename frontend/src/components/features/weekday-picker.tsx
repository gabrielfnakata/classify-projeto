import { cn } from "@/lib/utils"

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

interface WeekdayPickerProps {
  value: number[]
  onChange: (value: number[]) => void
  className?: string
}

export function WeekdayPicker({ value, onChange, className }: WeekdayPickerProps) {
  const toggle = (day: number) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort())
  }

  return (
    <div className={cn("inline-flex rounded-lg border border-border bg-panel-strong p-1 shadow-sm", className)}>
      {WEEKDAY_LABELS.map((label, day) => {
        const isActive = value.includes(day)

        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? "bg-card text-foreground shadow-sm"
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
