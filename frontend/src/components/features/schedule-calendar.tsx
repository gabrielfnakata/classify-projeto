import { useRef, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { formatYMD, formatMonthYearLabel } from "@/shared/utils/date-formatter"
import type { ClassSession } from "@/shared/models/class-session"


interface ScheduleCalendarProps {
  sessions: ClassSession[]
  viewMode: "day" | "week" | "month"
  currentDate: Date
  onSessionClick: (session: ClassSession) => void
}

const HOUR_HEIGHT = 64
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const WEEK_DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const statusBgClasses: Record<ClassSession["status"], string> = {
  info: "bg-info/20 text-info-foreground hover:bg-info/30",
  success: "bg-success/20 text-success-foreground hover:bg-success/30",
  warning: "bg-warning/20 text-warning-foreground hover:bg-warning/30",
  danger: "bg-destructive/10 text-destructive hover:bg-destructive/20",
}

const statusBorderColors: Record<ClassSession["status"], string> = {
  info: "var(--info)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

interface LayoutedSession {
  session: ClassSession
  col: number
  colCount: number
}

function layoutSessions(sessions: ClassSession[]): LayoutedSession[] {
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  )

  const columnEnds: number[] = []
  const assignments: { session: ClassSession; col: number }[] = []

  for (const session of sorted) {
    const start = timeToMinutes(session.startTime)
    const end = timeToMinutes(session.endTime)
    let col = columnEnds.findIndex((e) => e <= start)
    if (col === -1) {
      col = columnEnds.length
      columnEnds.push(end)
    } else {
      columnEnds[col] = end
    }
    assignments.push({ session, col })
  }

  return assignments.map(({ session, col }) => {
    const start = timeToMinutes(session.startTime)
    const end = timeToMinutes(session.endTime)
    const overlapCols = assignments
      .filter((a) => {
        const s = timeToMinutes(a.session.startTime)
        const e = timeToMinutes(a.session.endTime)
        return s < end && e > start
      })
      .map((a) => a.col)
    return { session, col, colCount: Math.max(...overlapCols) + 1 }
  })
}

function TimeGutter() {
  return (
    <div
      className="relative w-14 shrink-0 border-r border-border bg-card"
      style={{ height: 24 * HOUR_HEIGHT }}
    >
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute right-2 select-none text-[10px] leading-none text-muted-foreground"
          style={{ top: hour * HOUR_HEIGHT - 6 }}
        >
          {hour > 0 ? `${String(hour).padStart(2, "0")}:00` : ""}
        </div>
      ))}
    </div>
  )
}

function HourLines() {
  return (
    <>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="pointer-events-none absolute left-0 right-0 border-t border-border/40"
          style={{ top: hour * HOUR_HEIGHT }}
        />
      ))}
    </>
  )
}

function CurrentTimeLine({ date }: { date: Date }) {
  const isToday = formatYMD(date) === formatYMD(new Date())
  if (!isToday) return null

  const now = new Date()
  const top = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
      style={{ top }}
    >
      <div className="-ml-1 h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />
      <div className="h-px flex-1 bg-destructive" />
    </div>
  )
}

function SessionBlock({
  session,
  col,
  colCount,
  onSessionClick,
}: {
  session: ClassSession
  col: number
  colCount: number
  onSessionClick: (s: ClassSession) => void
}) {
  const startMins = timeToMinutes(session.startTime)
  const endMins = timeToMinutes(session.endTime)
  const top = (startMins / 60) * HOUR_HEIGHT
  const height = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT, 22)
  const widthPct = 100 / colCount
  const leftPct = col * widthPct

  return (
    <button
      type="button"
      onClick={() => onSessionClick(session)}
      className={cn(
        "absolute overflow-hidden rounded border-l-[3px] px-1.5 py-0.5 text-left text-xs transition-all active:scale-[0.98]",
        statusBgClasses[session.status]
      )}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        borderLeftColor: statusBorderColors[session.status],
      }}
    >
      <div className="truncate font-semibold leading-tight">{session.subject}</div>
      {height >= 40 && (
        <div className="mt-0.5 truncate leading-tight opacity-70">
          {session.startTime}–{session.endTime}
        </div>
      )}
      {height >= 56 && (
        <div className="truncate leading-tight opacity-60">{session.room}</div>
      )}
    </button>
  )
}

function DayView({
  sessions,
  currentDate,
  scrollRef,
  onSessionClick,
}: {
  sessions: ClassSession[]
  currentDate: Date
  scrollRef: { current: HTMLDivElement | null }
  onSessionClick: (s: ClassSession) => void
}) {
  const layouted = useMemo(
    () => layoutSessions(sessions.filter((s) => s.date === formatYMD(currentDate))),
    [sessions, currentDate]
  )

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="flex" style={{ height: 24 * HOUR_HEIGHT }}>
        <TimeGutter />
        <div className="relative flex-1">
          <HourLines />
          {layouted.map(({ session, col, colCount }) => (
            <SessionBlock
              key={session.id}
              session={session}
              col={col}
              colCount={colCount}
              onSessionClick={onSessionClick}
            />
          ))}
          <CurrentTimeLine date={currentDate} />
        </div>
      </div>
    </div>
  )
}

function WeekView({
  sessions,
  currentDate,
  scrollRef,
  onSessionClick,
}: {
  sessions: ClassSession[]
  currentDate: Date
  scrollRef: { current: HTMLDivElement | null }
  onSessionClick: (s: ClassSession) => void
}) {
  const todayStr = formatYMD(new Date())

  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - currentDate.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="z-10 flex shrink-0 border-b border-border bg-card">
        <div className="w-14 shrink-0 border-r border-border" />
        {weekDays.map((day, i) => {
          const dayStr = formatYMD(day)
          const isToday = dayStr === todayStr
          return (
            <div
              key={dayStr}
              className="min-w-0 flex-1 border-r border-border/50 py-2 text-center last:border-r-0"
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {WEEK_DAY_LABELS[i]}
              </div>
              <div
                className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="flex min-w-[560px]" style={{ height: 24 * HOUR_HEIGHT }}>
          <TimeGutter />
          {weekDays.map((day) => {
            const dayStr = formatYMD(day)
            const isToday = dayStr === todayStr
            const daySessions = sessions.filter((s) => s.date === dayStr)
            const layouted = layoutSessions(daySessions)

            return (
              <div
                key={dayStr}
                className={cn(
                  "relative min-w-0 flex-1 border-r border-border/30 last:border-r-0",
                  isToday && "bg-primary/[0.025]"
                )}
              >
                <HourLines />
                {layouted.map(({ session, col, colCount }) => (
                  <SessionBlock
                    key={session.id}
                    session={session}
                    col={col}
                    colCount={colCount}
                    onSessionClick={onSessionClick}
                  />
                ))}
                <CurrentTimeLine date={day} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MonthView({
  sessions,
  currentDate,
  onSessionClick,
}: {
  sessions: ClassSession[]
  currentDate: Date
  onSessionClick: (s: ClassSession) => void
}) {
  const todayStr = formatYMD(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const totalCells = Math.ceil((startPadding + lastDay.getDate()) / 7) * 7

  const cells: (Date | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const offset = i - startPadding
    if (offset < 0 || offset >= lastDay.getDate()) return null
    return new Date(year, month, offset + 1)
  })

  return (
    <div className="overflow-auto p-4">
      <div className="mb-2 text-center text-sm font-semibold text-foreground capitalize">
        {formatMonthYearLabel(currentDate)}
      </div>
      <div className="mb-1 grid grid-cols-7">
        {WEEK_DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="min-h-[96px] bg-muted/30" />
          }
          const dateStr = formatYMD(date)
          const isToday = dateStr === todayStr
          const daySessions = sessions.filter((s) => s.date === dateStr)
          const visible = daySessions.slice(0, 3)
          const hidden = daySessions.length - visible.length

          return (
            <div key={dateStr} className="min-h-[96px] bg-background p-1.5">
              <div
                className={cn(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {visible.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => onSessionClick(session)}
                    className={cn(
                      "w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium transition-opacity hover:opacity-80",
                      statusBgClasses[session.status]
                    )}
                  >
                    {session.subject}
                  </button>
                ))}
                {hidden > 0 && (
                  <div className="px-1 text-[10px] text-muted-foreground">
                    +{hidden} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ScheduleCalendar({
  sessions,
  viewMode,
  currentDate,
  onSessionClick,
}: ScheduleCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current || viewMode === "month") return
    const now = new Date()
    const isToday = formatYMD(currentDate) === formatYMD(now)
    const targetHour = isToday ? Math.max(0, now.getHours() - 1) : 8
    scrollRef.current.scrollTop = targetHour * HOUR_HEIGHT
  }, [viewMode, currentDate])

  return (
    <div className="flex h-[600px] flex-col overflow-hidden">
      {viewMode === "month" && (
        <MonthView
          sessions={sessions}
          currentDate={currentDate}
          onSessionClick={onSessionClick}
        />
      )}
      {viewMode === "week" && (
        <WeekView
          sessions={sessions}
          currentDate={currentDate}
          scrollRef={scrollRef}
          onSessionClick={onSessionClick}
        />
      )}
      {viewMode === "day" && (
        <DayView
          sessions={sessions}
          currentDate={currentDate}
          scrollRef={scrollRef}
          onSessionClick={onSessionClick}
        />
      )}
    </div>
  )
}
