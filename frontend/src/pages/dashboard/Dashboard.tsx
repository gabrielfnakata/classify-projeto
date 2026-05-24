import { useMemo, useState } from "react"
import { format, isBefore, isToday, parseISO, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

import { EmptyState } from "@/components/common/empty-state"
import { DailyTimeline } from "@/components/features/daily-timeline"
import { AdminTodayClassesWidget } from "@/components/features/dashboard/admin-today"
import {
  AdminMetricsWidget,
  ProfessorMetricsWidget,
  type DashboardMetricsData,
} from "@/components/features/dashboard/dashboard-metrics"
import { ProfessorWeekWidget } from "@/components/features/dashboard/professor-week"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useFetch from "@/hooks/useFetch"
import { cn } from "@/lib/utils"
import type { ClassSessionGetDTO } from "@/shared/dtos/class-session-get-dto"
import type { TimelineEvent } from "@/shared/dtos/timeline-event"
import { getEventColorTheme } from "@/shared/utils/event-color-theme"

type UserRole = "ADMIN" | "PROFESSOR"

interface DashboardProps {
  userRole?: UserRole
}

const dashboardConfig = {
  ADMIN: {
    topSectionTitle: "Aulas de hoje",
    middleSectionTitle: "Relatórios e aulas",
    MiddleWidget: AdminMetricsWidget,
    calendarType: "TIMELINE",
  },
  PROFESSOR: {
    topSectionTitle: "Minha semana",
    middleSectionTitle: "Relatórios e aulas",
    MiddleWidget: ProfessorMetricsWidget,
    calendarType: "LIST",
  },
} as const

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatHeaderDate(baseDate: Date) {
  const weekDay = format(baseDate, "EEEE", { locale: ptBR })
  const day = format(baseDate, "d")
  const month = format(baseDate, "MMMM", { locale: ptBR })
  const year = format(baseDate, "yyyy")

  return `${capitalize(weekDay)}, ${day} de ${capitalize(month)} de ${year}`
}

function mapClassSessionToTimelineEvent(dto: ClassSessionGetDTO): TimelineEvent {
  return {
    id: dto.uuid,
    date: dto.startTime.split("T")[0],
    startTime: format(new Date(dto.startTime), "HH:mm"),
    endTime: format(new Date(dto.endTime), "HH:mm"),
    title: dto.subjectTeacher?.subject || "Aula",
    subtitle: dto.classroom?.name || "Sala não definida",
  }
}

export default function Dashboard({ userRole = "PROFESSOR" }: DashboardProps) {
  const viewConfig = dashboardConfig[userRole]
  const MiddleWidget = viewConfig.MiddleWidget

  const [date, setDate] = useState<Date | undefined>(new Date())
  const selectedDate = date ?? new Date()
  const formattedApiDate = format(selectedDate, "yyyy-MM-dd")

  const { data: dailySessionsRaw, loading: loadingDaily } = useFetch<ClassSessionGetDTO[]>(
    `/classsession/date/${formattedApiDate}`
  )
  const dailySessions = Array.isArray(dailySessionsRaw) ? dailySessionsRaw : []

  const dailyClasses = useMemo(
    () => dailySessions.map(mapClassSessionToTimelineEvent),
    [dailySessions]
  )

  const metrics: DashboardMetricsData = {
    pendingReports: 0,
    completedClasses: dailyClasses.length,
    totalClassesToday: dailyClasses.length,
  }

  const daysWithClasses = dailyClasses.map((classSession) => parseISO(classSession.date ?? formattedApiDate))

  const isTodaySelected = isToday(selectedDate)
  const isPastDate = isBefore(startOfDay(selectedDate), startOfDay(new Date()))

  const currentMonth = format(selectedDate, "MMMM yyyy", { locale: ptBR })
  const formattedCurrentMonth = capitalize(currentMonth)

  const dynamicTopTitle =
    userRole === "ADMIN"
      ? isTodaySelected
        ? "Aulas de hoje"
        : `Aulas do dia ${format(selectedDate, "dd/MM")}`
      : viewConfig.topSectionTitle

  const handleOpenClassModal = (classSession: TimelineEvent) => {
    console.log("Abrir modal:", classSession)
  }

  const handleOpenMetricModal = (type: string) => {
    console.log("Métrica clicada:", type)
  }

  return (
    <div className="w-full animate-in fade-in-50 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{dynamicTopTitle}</h2>

        {userRole === "ADMIN" ? (
          <AdminTodayClassesWidget dailyClasses={dailyClasses} onClassClick={handleOpenClassModal} />
        ) : (
          <ProfessorWeekWidget
            date={selectedDate}
            weeklyClasses={dailyClasses}
            onClassClick={handleOpenClassModal}
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{viewConfig.middleSectionTitle}</h2>

        <MiddleWidget
          date={selectedDate}
          formattedCurrentMonth={formattedCurrentMonth}
          metrics={metrics}
          onMetricClick={handleOpenMetricModal}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Calendário</h2>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <Card className="col-span-1 overflow-hidden">
            <CardContent className="flex justify-center p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                className="max-w-full rounded-md"
                showOutsideDays={false}
                modifiers={{ hasClasses: daysWithClasses }}
                modifiersClassNames={{
                  hasClasses: "bg-primary/15 font-medium text-primary",
                }}
              />
            </CardContent>
          </Card>

          <div className="col-span-1 lg:col-span-2">
            {loadingDaily ? (
              <Card>
                <CardContent className="flex justify-center py-20">
                  <p className="font-medium text-muted-foreground animate-pulse">Carregando aulas...</p>
                </CardContent>
              </Card>
            ) : dailyClasses.length === 0 ? (
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle className="text-xl font-medium">
                    {date ? formatHeaderDate(date) : "Selecione uma data"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex min-h-[280px] items-center justify-center">
                  <EmptyState
                    title="Nenhuma aula agendada"
                    description="Não há compromissos marcados para esta data."
                    action={
                      !isPastDate ? (
                        <Button className="mt-4 h-11 px-5 text-sm font-semibold">Agendar nova aula</Button>
                      ) : undefined
                    }
                  />
                </CardContent>
              </Card>
            ) : viewConfig.calendarType === "TIMELINE" ? (
              <DailyTimeline date={selectedDate} events={dailyClasses} onEventClick={handleOpenClassModal} />
            ) : (
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle className="text-xl font-medium">
                    {date ? formatHeaderDate(date) : "Selecione uma data"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {dailyClasses.map((classSession) => (
                    <div key={classSession.id} className="flex w-full items-start gap-4">
                      <div className="flex w-16 shrink-0 flex-col items-center pt-2">
                        <span className="text-sm font-bold text-foreground">{classSession.startTime}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">{classSession.endTime}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenClassModal(classSession)}
                        className={cn(
                          "flex flex-1 cursor-pointer flex-col justify-center overflow-hidden rounded-lg border border-l-4 border-border/20 p-3 text-left shadow-sm transition-all hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          getEventColorTheme(classSession.subtitle)
                        )}
                      >
                        <p className="w-full truncate text-sm font-bold">{classSession.title}</p>
                        <p className="mt-0.5 w-full truncate text-xs opacity-80">{classSession.subtitle}</p>
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
