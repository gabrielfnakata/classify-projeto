import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { formatHHMM, toDate } from "@/shared/utils/date-formatter"
import { sessionStatus } from "@/shared/utils/class-session"
import type { ClassSessionApiDTO } from "@/shared/dtos/class-session/ClassSessionApiDTO"

const START_HOUR = 6
const END_HOUR = 23
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
const HOUR_HEIGHT = 64
const TIMELINE_HEIGHT = (HOURS.length - 1) * HOUR_HEIGHT
const CONTAINER_HEIGHT = 280
const EDGE_PADDING = 40

function minutesFromStart(date: Date) {
  return (date.getHours() - START_HOUR) * 60 + date.getMinutes()
}

function sessionLayout(session: ClassSessionApiDTO) {
  const start = toDate(session.startTime)
  const end = toDate(session.endTime)
  const top = (minutesFromStart(start) / 60) * HOUR_HEIGHT + 2
  const durationMinutes = (end.getTime() - start.getTime()) / 60000
  const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT - 4, 44)
  return { start, end, top, height }
}

interface MiniDayAgendaProps<T extends ClassSessionApiDTO> {
  sessions: T[]
  activeUuid: string | null
  onSelect: (uuid: string) => void
}

export function MiniDayAgenda<T extends ClassSessionApiDTO>({
  sessions,
  activeUuid,
  onSelect,
}: MiniDayAgendaProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return

    const first = [...sessions].sort((a, b) => toDate(a.startTime).getTime() - toDate(b.startTime).getTime())[0]
    if (!first) return

    const { top, height } = sessionLayout(first)
    const blockCenter = EDGE_PADDING + top + height / 2
    scrollRef.current.scrollTop = blockCenter - CONTAINER_HEIGHT / 2
  }, [sessions])

  return (
    <div
      ref={scrollRef}
      className="scrollbar-themed overflow-y-auto rounded-lg border border-border"
      style={{ height: CONTAINER_HEIGHT }}
    >
      <div style={{ paddingBlock: EDGE_PADDING }}>
        <div className="relative flex" style={{ height: TIMELINE_HEIGHT }}>
          <div className="relative w-14 shrink-0 border-r border-border">
            {HOURS.map((h, i) => (
              <span
                key={h}
                className="absolute right-2 text-xs font-semibold text-muted-foreground"
                style={{ top: i * HOUR_HEIGHT - 10 }}
              >
                {String(h).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          <div className="relative flex-1">
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="pointer-events-none absolute left-0 right-0 border-t border-border/50"
                style={{ top: i * HOUR_HEIGHT }}
              />
            ))}

            {sessions.map((s) => {
              const { start, end, top, height } = sessionLayout(s)
              const status = sessionStatus(s)
              const isActive = activeUuid === s.uuid

              return (
                <button
                  key={s.uuid}
                  type="button"
                  onClick={() => onSelect(s.uuid)}
                  style={{ top, height }}
                  className={cn(
                    "absolute left-2 right-2 overflow-hidden rounded-lg border-l-[3px] px-2.5 py-1.5 text-left text-xs transition-colors",
                    status === "success" ? "border-l-[color:var(--success)]" : "border-l-[color:var(--info)]",
                    isActive
                      ? status === "success"
                        ? "bg-success/35"
                        : "bg-info/35"
                      : status === "success"
                        ? "bg-success/15 hover:bg-success/25"
                        : "bg-info/15 hover:bg-info/25"
                  )}
                >
                  <div className="font-semibold text-foreground">
                    {formatHHMM(start)}–{formatHHMM(end)}
                  </div>
                  <div className="truncate text-muted-foreground">{s.subjectTeacher.subject.description}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
