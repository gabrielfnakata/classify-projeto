import { cn } from "@/lib/utils"
import type { AttendanceStatus } from "@/shared/dtos/attendance/AttendanceRosterEntryDTO"

const NEXT_STATUS: Record<string, AttendanceStatus | null> = {
  null: "PRESENTE",
  PRESENTE: "AUSENTE",
  AUSENTE: null,
}

interface AttendanceStatusCellProps {
  value: AttendanceStatus | null
  onChange: (next: AttendanceStatus | null) => void
  disabled?: boolean
  title?: string
  className?: string
}

export function AttendanceStatusCell({
  value,
  onChange,
  disabled = false,
  title,
  className,
}: AttendanceStatusCellProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title ?? "Clique para alternar presença → falta → em branco"}
      onClick={() => onChange(NEXT_STATUS[String(value)])}
      className={cn(
        "flex h-8 w-14 items-center justify-center rounded-md border text-xs font-bold transition-colors",
        disabled && "cursor-not-allowed border-dashed border-border/60 bg-muted/30 text-muted-foreground/40",
        !disabled && value === null && "border-border bg-panel-soft text-muted-foreground hover:bg-accent",
        !disabled && value === "PRESENTE" && "border-success/40 bg-success/20 text-success-foreground",
        !disabled && value === "AUSENTE" && "border-destructive/40 bg-destructive/15 text-destructive",
        className
      )}
    >
      {disabled ? "–" : value === "PRESENTE" ? "P" : value === "AUSENTE" ? "F" : "·"}
    </button>
  )
}
