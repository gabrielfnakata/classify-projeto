import { useMemo } from "react"

import { cn } from "@/lib/utils"
import { formatHHMM } from "@/shared/utils/date-formatter"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"

const HOUR_HEIGHT = 48

// Mesma paleta de status usada em schedule-calendar.tsx (agenda do professor),
// reaproveitada aqui para manter consistência visual entre as duas telas.
type SessionStatus = "info" | "success"

function sessionStatus(session: ClassSessionDTO): SessionStatus {
  return new Date(session.endTime as unknown as string) < new Date() ? "success" : "info"
}

interface MiniDayAgendaProps<T extends ClassSessionDTO> {
  sessions: T[]
  activeUuid: string | null
  onSelect: (uuid: string) => void
}

export function MiniDayAgenda<T extends ClassSessionDTO>({ sessions, activeUuid, onSelect }: MiniDayAgendaProps<T>) {
  const hours = useMemo(() => {
    const allHours = sessions.flatMap((s) => [
      new Date(s.startTime as unknown as string).getHours(),
      new Date(s.endTime as unknown as string).getHours(),
    ])
    // sempre mostra pelo menos uma janela de 3h, com folga de 1h antes/depois
    const minHour = Math.max(0, Math.min(...allHours) - 1)
    const maxHour = Math.max(Math.min(23, Math.max(...allHours) + 1), minHour + 2)
    return Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i)
  }, [sessions])

  const rangeStart = hours[0]

  function minutesFromStart(date: Date) {
    return (date.getHours() - rangeStart) * 60 + date.getMinutes()
  }

  return (
    <div className="scrollbar-themed max-h-72 overflow-y-auto rounded-lg border border-border">
      <div className="relative flex" style={{ height: hours.length * HOUR_HEIGHT }}>
        <div className="w-14 shrink-0 border-r border-border">
          {hours.map((h) => (
            <div key={h} className="relative" style={{ height: HOUR_HEIGHT }}>
              <span className="absolute -top-2.5 right-2 text-xs font-semibold text-muted-foreground">
                {String(h).padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex-1">
          {hours.map((h, i) => (
            <div
              key={h}
              className="pointer-events-none absolute left-0 right-0 border-t border-border/50"
              style={{ top: i * HOUR_HEIGHT }}
            />
          ))}

          {sessions.map((s) => {
            const start = new Date(s.startTime as unknown as string)
            const end = new Date(s.endTime as unknown as string)
            const top = (minutesFromStart(start) / 60) * HOUR_HEIGHT
            const height = Math.max(((minutesFromStart(end) - minutesFromStart(start)) / 60) * HOUR_HEIGHT - 4, 44)
            const status = sessionStatus(s)
            const isActive = activeUuid === s.uuid

            return (
              <button
                key={s.uuid}
                type="button"
                onClick={() => onSelect(s.uuid)}
                style={{ top: top + 2, height }}
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
                <div className="truncate text-muted-foreground">{s.subjectTeacher.subject}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
