import { cn } from "@/lib/utils"
import type { AttendanceStatus } from "@/shared/dtos/attendance/AttendanceRosterEntryDTO"

interface AttendanceStatusToggleProps {
  value: AttendanceStatus | null
  onChange: (value: AttendanceStatus | null) => void
  className?: string
}

const OPTIONS: { label: string; value: AttendanceStatus }[] = [
  { label: "Presente", value: "PRESENTE" },
  { label: "Ausente", value: "AUSENTE" },
]

export function AttendanceStatusToggle({ value, onChange, className }: AttendanceStatusToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-panel-strong p-1 shadow-sm",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            title={isActive ? "Clique para desmarcar" : `Marcar como ${option.label.toLowerCase()}`}
            onClick={() => onChange(isActive ? null : option.value)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? option.value === "PRESENTE"
                  ? "bg-success text-success-foreground shadow-sm"
                  : "bg-destructive/15 text-destructive shadow-sm"
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
