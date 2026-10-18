import { useEffect, useMemo, useState } from "react"
import { BookOpen, Clock, FileText, Mail, User } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { SectionTitle } from "@/components/features/section-title"
import { ContentCard } from "@/components/layout/content-card"
import { CircularProgress } from "@/components/common/circular-progress"
import { MiniDayAgenda } from "@/components/features/mini-day-agenda"
import { MonthCalendar } from "@/components/features/month-calendar"
import { StatusBadge } from "@/components/features/status-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import useFetch from "@/hooks/useFetch"
import api from "@/services/api"
import { formatFullDateLabel, formatHHMM, formatYMD, toDate } from "@/shared/utils/date-formatter"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO"
import type { AttendanceGetDTO } from "@/shared/dtos/attendance/AttendanceGetDTO"

function atToday(hour: number, minute = 0, dayOffset = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d
}

const TODAY = new Date()
const MONDAY_OFFSET = 1 - TODAY.getDay()
const WEEKDAY_LABELS_LONG = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const WEEK_VIEW_OFFSETS = [0, 1, 2, 3, 4, 5]

function sessionDateKey(session: ClassSessionDTO): string {
  return formatYMD(toDate(session.startTime))
}

export default function StudentHomePage() {
  const { data: rawSessions } = useFetch<ClassSessionDTO>("/student/me/schedule")
  const { data: attendanceRecords } = useFetch<AttendanceGetDTO>("/student/me/attendance")
  const [student, setStudent] = useState<StudentDTO | null>(null)
  const [profileError, setProfileError] = useState(false)
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(formatYMD(new Date()))
  const [activeSessionUuid, setActiveSessionUuid] = useState<string | null>(null)

  useEffect(() => {
    api.get<StudentDTO>("/student/me")
      .then((response) => setStudent(response.data))
      .catch(() => setProfileError(true))
  }, [])

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, ClassSessionDTO[]>()
    for (const session of rawSessions ?? []) {
      const key = sessionDateKey(session)
      const list = map.get(key) ?? []
      list.push(session)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => toDate(a.startTime).getTime() - toDate(b.startTime).getTime())
    }
    return map
  }, [rawSessions])

  const weekDays = useMemo(
    () => WEEK_VIEW_OFFSETS.map((offset) => atToday(0, 0, MONDAY_OFFSET + offset)),
    []
  )

  const selectedDaySessions = sessionsByDate.get(selectedDate) ?? []
  const presences = attendanceRecords?.filter((record) => record.status === "PRESENTE").length ?? 0
  const absences = attendanceRecords?.filter((record) => record.status === "AUSENTE").length ?? 0
  const attendanceCount = presences + absences
  const attendancePercent = attendanceCount === 0 ? 0 : Math.round((presences / attendanceCount) * 100)
  const activeSession =
    selectedDaySessions.find((s) => s.uuid === activeSessionUuid) ?? selectedDaySessions[0] ?? null
  const activeStatus = activeSession
    ? toDate(activeSession.endTime) < new Date() ? "success" : "info"
    : null

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr)
    setActiveSessionUuid(null)
  }

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(month)
    d.setMonth(d.getMonth() + dir)
    setMonth(d)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8 md:p-10">
      <PageHeader title={profileError ? "Meu espaço de estudante" : `Olá, ${student?.name ?? "estudante"}!`} />

      <div>
        <SectionTitle title="Minha semana" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {weekDays.map((day) => {
            const dayStr = formatYMD(day)
            const isToday = dayStr === formatYMD(TODAY)
            const daySessions = sessionsByDate.get(dayStr) ?? []

            return (
              <ContentCard
                key={dayStr}
                className={cn("min-h-[160px] p-5 text-center", isToday && "border-primary/50 bg-primary/[0.06]")}
              >
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {WEEKDAY_LABELS_LONG[day.getDay()]}
                </div>
                <div className="mt-3 space-y-2">
                  {daySessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem aulas</p>
                  ) : (
                    daySessions.map((s) => (
                      <div key={s.uuid} className="truncate text-sm text-foreground">
                        <span className="font-semibold">{formatHHMM(s.startTime)}</span> -{" "}
                        {s.subjectTeacher.employee.name}, {s.subjectTeacher.subject.description}
                      </div>
                    ))
                  )}
                </div>
              </ContentCard>
            )
          })}
        </div>
      </div>

      <div>
        <SectionTitle title="Resumo do aluno" />
        <ContentCard className="p-8">
          <div className="flex flex-wrap items-center gap-6">
            <CircularProgress percent={attendancePercent} size={120} stroke={18} />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Frequência: {attendancePercent}%</p>
              <p className="text-sm text-muted-foreground">{presences} presenças · {absences} faltas</p>
              {attendanceCount === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda não há registros de frequência.</p>
              ) : null}
            </div>
          </div>
        </ContentCard>
      </div>

      <div>
        <SectionTitle title="Calendário" />
        <div className="grid gap-8 lg:grid-cols-2">
          <MonthCalendar
            month={month}
            sessionsByDate={sessionsByDate}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onNavigate={navigateMonth}
          />

          <div className="space-y-6">
            <ContentCard className="space-y-4">
              <h3 className="text-sm font-bold capitalize text-foreground">
                {formatFullDateLabel(new Date(selectedDate + "T00:00:00"))}
              </h3>

              {selectedDaySessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem aulas neste dia. Selecione outra data no calendário.</p>
              ) : (
                <>
                  <MiniDayAgenda
                    sessions={selectedDaySessions}
                    activeUuid={activeSession?.uuid ?? null}
                    onSelect={setActiveSessionUuid}
                  />

                  {activeSession && (
                    <div className="rounded-xl bg-muted p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                        <span className="font-bold text-foreground">
                          {activeSession.subjectTeacher.subject.description}
                        </span>
                        <span className="text-sm text-muted-foreground">{formatHHMM(activeSession.startTime)}</span>
                        <StatusBadge variant={activeStatus === "success" ? "success" : "info"}>
                          {activeStatus === "success" ? "Concluída" : "Agendada"}
                        </StatusBadge>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          Conteúdo
                        </div>
                        <p className="pl-5 text-sm text-foreground">
                          {activeSession.report?.content || "O professor ainda não registrou o conteúdo desta aula."}
                        </p>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          Professor(a)
                        </div>
                        <p className="pl-5 text-sm text-foreground">{activeSession.subjectTeacher.employee.name}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <Button variant="outline" className="h-11 w-full rounded-2xl text-sm">
                <Mail className="h-4 w-4" />
                Enviar mensagem ao professor
              </Button>
            </ContentCard>

            <Button className="h-11 w-full rounded-2xl text-sm">
              <Clock className="h-4 w-4" />
              Solicitar agendamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
