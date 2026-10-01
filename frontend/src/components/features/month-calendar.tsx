import { ChevronLeft, ChevronRight } from "lucide-react"

import { ContentCard } from "@/components/layout/content-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatMonthYearLabel, formatYMD } from "@/shared/utils/date-formatter"

const WEEKDAY_LABELS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"]

interface MonthCalendarProps<T> {
  month: Date
  sessionsByDate: Map<string, T[]>
  selectedDate: string
  onSelectDate: (dateStr: string) => void
  onNavigate: (dir: -1 | 1) => void
}

export function MonthCalendar<T>({
  month,
  sessionsByDate,
  selectedDate,
  onSelectDate,
  onNavigate,
}: MonthCalendarProps<T>) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstDay = new Date(year, m, 1)
  const lastDay = new Date(year, m + 1, 0)
  const startPadding = firstDay.getDay()
  const totalCells = Math.ceil((startPadding + lastDay.getDate()) / 7) * 7
  const todayStr = formatYMD(new Date())

  const cells: (Date | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const offset = i - startPadding
    if (offset < 0 || offset >= lastDay.getDate()) return null
    return new Date(year, m, offset + 1)
  })

  return (
    <ContentCard className="flex h-full flex-col p-10">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => onNavigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold text-foreground capitalize">{formatMonthYearLabel(month)}</span>
        <Button variant="ghost" size="icon" onClick={() => onNavigate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="grid grid-cols-7 gap-y-6 text-center">
          {WEEKDAY_LABELS_SHORT.map((label, i) => (
            <div key={i} className="pb-4 text-base font-bold text-info-foreground">
              {label}
            </div>
          ))}

          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />

            const dateStr = formatYMD(date)
            const hasSessions = sessionsByDate.has(dateStr)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate

            return (
              <div key={dateStr} className="flex items-center justify-center py-0.5">
                <button
                  type="button"
                  onClick={() => onSelectDate(dateStr)}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full text-lg font-medium transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : hasSessions
                        ? "bg-info/40 text-info-foreground hover:bg-info/60"
                        : isToday
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent"
                  )}
                >
                  {date.getDate()}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </ContentCard>
  )
}
