import { CalendarCheck, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  MAX_RECURRING_DATES,
  describeDateList,
  describeWeekdays,
  generateRecurringDates,
} from "@/shared/utils/recurrence"

interface RecurrencePreviewProps {
  date: string
  until: string
  weekdays: number[]
  perDate?: number
  className?: string
}

export function RecurrencePreview({ date, until, weekdays, perDate = 1, className }: RecurrencePreviewProps) {
  if (!date || !until || weekdays.length === 0) return null

  if (until < date) {
    return (
      <p className={cn("flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive", className)}>
        <TriangleAlert className="h-4 w-4 shrink-0" />
        A data final é anterior à data inicial.
      </p>
    )
  }

  const dates = generateRecurringDates(date, until, weekdays)

  if (dates.length === 0) {
    return (
      <p className={cn("flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground", className)}>
        <TriangleAlert className="h-4 w-4 shrink-0" />
        Nenhuma data cai nos dias da semana escolhidos nesse período.
      </p>
    )
  }

  const total = dates.length * perDate
  const hitCap = dates.length >= MAX_RECURRING_DATES
  const many = dates.length > 20

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        many
          ? "border-warning/40 bg-warning/10 text-warning-foreground"
          : "border-border bg-panel-soft text-muted-foreground",
        className
      )}
    >
      {many ? (
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="font-medium">
          {dates.length} {dates.length === 1 ? "data" : "datas"} ({describeWeekdays(weekdays)})
          {perDate > 1 && ` · ${total} aulas no total, ${perDate} alunos por data`}
        </p>
        <p className="mt-0.5 truncate text-xs opacity-80">{describeDateList(dates)}</p>
        {hitCap && (
          <p className="mt-0.5 text-xs font-medium">
            Limite de {MAX_RECURRING_DATES} datas atingido — encurte o período.
          </p>
        )}
      </div>
    </div>
  )
}
