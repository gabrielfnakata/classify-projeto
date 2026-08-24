import { useMemo, useState } from "react"
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
import { formatFullDateLabel, formatHHMM, formatYMD } from "@/shared/utils/date-formatter"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"

// Ainda não há dados reais no banco para esta tela (nem tabela de presença/
// pendências). Tudo abaixo é mock só para validar o layout com a API real
// futuramente — trocar por useFetch('/classsession') quando houver dados.
type MockSession = ClassSessionDTO & { content?: string }

function atToday(hour: number, minute = 0, dayOffset = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d
}

function mockSession(
  id: string,
  dayOffset: number,
  h1: number,
  h2: number,
  subject: string,
  teacher: string,
  room: string,
  content?: string
): MockSession {
  return {
    uuid: id,
    subjectTeacher: { uuidEmployee: `emp-${teacher}`, employee: teacher, uuidSubject: `sub-${subject}`, subject },
    classroom: { uuid: `room-${room}`, name: room },
    startTime: atToday(h1, 0, dayOffset),
    endTime: atToday(h2, 0, dayOffset),
    students: [],
    content,
  }
}

const TODAY = new Date()
const MONDAY_OFFSET = 1 - TODAY.getDay() // deslocamento até a segunda-feira desta semana

const MOCK_SESSIONS: MockSession[] = [
  mockSession("s1", MONDAY_OFFSET, 14, 15, "Matemática", "Glauco Condo", "Sala 12", "Frações e divisões"),
  mockSession("s2", MONDAY_OFFSET, 15, 16, "Matemática", "Glauco Condo", "Sala 12", "Exercícios de fixação"),
  mockSession("s3", MONDAY_OFFSET + 1, 14, 15, "Português", "Maria Silva", "Sala 4", "Interpretação de texto"),
  // Aulas bem espaçadas no mesmo dia, pra testar o scroll da mini agenda.
  mockSession("s3b", MONDAY_OFFSET + 2, 7, 8, "Educação Física", "Carlos Dias", "Quadra 1", "Alongamento e resistência"),
  mockSession("s3c", MONDAY_OFFSET + 2, 19, 20, "Inglês", "Beatriz Nunes", "Sala 9", "Verbos irregulares"),
  mockSession("s4", MONDAY_OFFSET + 3, 9, 10, "História", "João Pereira", "Sala 7"),
  mockSession("s5", MONDAY_OFFSET - 4, 10, 11, "Geografia", "Ana Souza", "Sala 2", "Relevo e clima"),
  mockSession("s6", MONDAY_OFFSET + 9, 13, 14, "Ciências", "Paulo Lima", "Sala 5"),
]

const MOCK_ATTENDANCE = { percent: 90, presences: 9, absences: 1 }
const MOCK_PENDING = { total: 5, reports: 2, activities: 3 }

const WEEKDAY_LABELS_LONG = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const WEEK_VIEW_OFFSETS = [0, 1, 2, 3, 4, 5] // segunda a sábado, a partir de MONDAY_OFFSET

// Mesma paleta de status usada em schedule-calendar.tsx (agenda do professor),
// reaproveitada aqui para manter consistência visual entre as duas telas.
type SessionStatus = "info" | "success"

function sessionStatus(session: ClassSessionDTO): SessionStatus {
  return new Date(session.endTime as unknown as string) < new Date() ? "success" : "info"
}

function sessionDateKey(session: ClassSessionDTO): string {
  return formatYMD(new Date(session.startTime as unknown as string))
}

export default function StudentDashboard() {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(formatYMD(new Date()))
  const [activeSessionUuid, setActiveSessionUuid] = useState<string | null>(null)

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, MockSession[]>()
    for (const s of MOCK_SESSIONS) {
      const key = sessionDateKey(s)
      const list = map.get(key) ?? []
      list.push(s)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) => new Date(a.startTime as unknown as string).getTime() - new Date(b.startTime as unknown as string).getTime()
      )
    }
    return map
  }, [])

  const weekDays = useMemo(
    () => WEEK_VIEW_OFFSETS.map((offset) => atToday(0, 0, MONDAY_OFFSET + offset)),
    []
  )

  const selectedDaySessions = sessionsByDate.get(selectedDate) ?? []
  const activeSession =
    selectedDaySessions.find((s) => s.uuid === activeSessionUuid) ?? selectedDaySessions[0] ?? null

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
      <PageHeader title="Olá, Nome da pessoa!" />

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
                className={cn("min-h-[132px] p-5 text-center", isToday && "border-primary/50 bg-primary/[0.06]")}
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
                        <span className="font-semibold">{formatHHMM(s.startTime)}</span> - {s.subjectTeacher.employee},{" "}
                        {s.subjectTeacher.subject}
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
        <div className="grid gap-8 sm:grid-cols-2">
          <ContentCard className="flex min-h-72 flex-col p-8">
            <div className="text-base font-bold uppercase tracking-wider text-muted-foreground">Frequência Total</div>
            <div className="flex flex-1 items-center gap-8">
              <CircularProgress percent={MOCK_ATTENDANCE.percent} size={140} stroke={22} />
              <div className="space-y-1">
                <p className="text-xl font-semibold text-foreground">{MOCK_ATTENDANCE.presences} presenças</p>
                <p className="text-lg text-muted-foreground">{MOCK_ATTENDANCE.absences} falta registrada</p>
              </div>
            </div>
          </ContentCard>

          <ContentCard className="flex min-h-72 flex-col p-8">
            <div className="text-base font-bold uppercase tracking-wider text-muted-foreground">Pendências Atuais</div>
            <div className="flex flex-1 flex-col justify-center gap-1">
              <p className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-foreground">{MOCK_PENDING.total}</span>
                <span className="text-xl text-muted-foreground">itens</span>
              </p>
              <p className="text-lg text-muted-foreground">
                {MOCK_PENDING.reports} relatórios · {MOCK_PENDING.activities} atividades
              </p>
              <Button className="mt-4 h-11 self-start px-6 text-base">Enviar pendências</Button>
            </div>
          </ContentCard>
        </div>
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
                        <span className="font-bold text-foreground">{activeSession.subjectTeacher.subject}</span>
                        <span className="text-sm text-muted-foreground">{formatHHMM(activeSession.startTime)}</span>
                        <StatusBadge variant={sessionStatus(activeSession) === "success" ? "success" : "info"}>
                          {sessionStatus(activeSession) === "success" ? "Concluída" : "Agendada"}
                        </StatusBadge>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          Conteúdo
                        </div>
                        <p className="pl-5 text-sm text-foreground">
                          {activeSession.content || "O professor ainda não registrou o conteúdo desta aula."}
                        </p>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          Professor(a)
                        </div>
                        <p className="pl-5 text-sm text-foreground">{activeSession.subjectTeacher.employee}</p>
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
