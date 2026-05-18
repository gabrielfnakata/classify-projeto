import { useMemo, useState } from "react";
import {
  format,
  isBefore,
  isToday,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { EmptyState } from "@/components/common/empty-state";
import {
  DailyTimeline,
  getPastelColorTheme,
} from "@/components/features/daily-timeline";
import type { TimelineEvent } from "@/components/features/daily-timeline";
import { AdminTodayClassesWidget } from "@/components/features/dashboard/admin-today";
import {
  AdminMetricsWidget,
  ProfessorMetricsWidget,
} from "@/components/features/dashboard/dashboard-metrics";
import type { DashboardMetricsData } from "@/components/features/dashboard/dashboard-metrics";
import { ProfessorWeekWidget } from "@/components/features/dashboard/professor-week";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import useFetch from "@/hooks/useFetch";
import { cn } from "@/lib/utils";

interface ClassSessionGetDTO {
  uuid: string;
  startTime: string;
  endTime: string;
  subjectTeacher?: {
    subject?: {
      name: string;
    };
    teacher?: {
      name: string;
    };
  };
  classroom?: {
    name: string;
  };
}

type UserRole = "ADMIN" | "PROFESSOR";

const DASHBOARD_CONFIG = {
  ADMIN: {
    topSectionTitle: "Aulas de hoje",
    middleSectionTitle: "Relatórios e aulas",
    MiddleWidget: AdminMetricsWidget,
    calendarType: "TIMELINE",
  },
  PROFESSOR: {
    topSectionTitle: "Minha semana",
    middleSectionTitle: "Relatórios e ganhos",
    MiddleWidget: ProfessorMetricsWidget,
    calendarType: "LIST",
  },
};

export default function Dashboard() {
  const userRole: UserRole = "ADMIN";
  const viewConfig = DASHBOARD_CONFIG[userRole];

  const MiddleWidget = viewConfig.MiddleWidget;

  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDate = date ?? new Date();

  const formattedApiDate = format(selectedDate, "yyyy-MM-dd");
  const formattedWeekStart = format(
    startOfWeek(selectedDate, { locale: ptBR }),
    "yyyy-MM-dd"
  );

  const { data: dailyClassesRaw, loading: loadingDaily } = useFetch(
    `/classsession/date/${formattedApiDate}`
  );

  const { data: weeklyClassesRaw } = useFetch(
    `/classsession/week/${formattedWeekStart}`
  );

  const { data: metricsRaw } = useFetch(
    `/metrics/dashboard?date=${formattedApiDate}`
  );

  const { data: availableDaysRaw } = useFetch("/classsession/available-days");

  const mapDtoToTimelineEvent = (dto: ClassSessionGetDTO): TimelineEvent => {
    return {
      id: dto.uuid,
      date: dto.startTime.split("T")[0],
      startTime: format(new Date(dto.startTime), "HH:mm"),
      endTime: format(new Date(dto.endTime), "HH:mm"),
      title: dto.subjectTeacher?.subject?.name || "Aula",
      subtitle: dto.classroom?.name || "Sala não definida",
    };
  };

  const dailyClassesRawTyped: ClassSessionGetDTO[] = Array.isArray(
    dailyClassesRaw
  )
    ? (dailyClassesRaw as ClassSessionGetDTO[])
    : [];

  const weeklyClassesRawTyped: ClassSessionGetDTO[] = Array.isArray(
    weeklyClassesRaw
  )
    ? (weeklyClassesRaw as ClassSessionGetDTO[])
    : [];

  const availableDaysRawTyped: string[] = Array.isArray(availableDaysRaw)
    ? (availableDaysRaw as string[])
    : [];

  const dailyClasses: TimelineEvent[] = dailyClassesRawTyped.map(
    mapDtoToTimelineEvent
  );

  const weeklyClasses: TimelineEvent[] = weeklyClassesRawTyped.map(
    mapDtoToTimelineEvent
  );

  const metrics: DashboardMetricsData =
    metricsRaw &&
    typeof metricsRaw === "object" &&
    "pendingReports" in metricsRaw
      ? (metricsRaw as DashboardMetricsData)
      : {
          pendingReports: 0,
          completedClasses: 0,
          totalClassesToday: 0,
        };

  const daysWithClasses = availableDaysRawTyped.map((day) => parseISO(day));

  const currentMonth = format(selectedDate, "MMMM yyyy", { locale: ptBR });
  const formattedCurrentMonth =
    currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  const getFormattedHeaderDate = (baseDate: Date) => {
    const weekDay = format(baseDate, "EEEE", { locale: ptBR });
    const day = format(baseDate, "d");
    const month = format(baseDate, "MMMM", { locale: ptBR });
    const year = format(baseDate, "yyyy");

    return `${
      weekDay.charAt(0).toUpperCase() + weekDay.slice(1)
    }, ${day} de ${
      month.charAt(0).toUpperCase() + month.slice(1)
    } de ${year}`;
  };

  const handleOpenClassModal = (classSession: TimelineEvent) => {
    console.log("Abrir modal:", classSession);
  };

  const handleOpenMetricModal = (type: string) => {
    console.log("Métrica clicada:", type);
  };

  const groupedClasses = useMemo<Record<string, TimelineEvent[]>>(() => {
    return dailyClasses.reduce<Record<string, TimelineEvent[]>>(
      (acc, classSession) => {
        const key = `${classSession.startTime}-${classSession.endTime}`;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(classSession);

        return acc;
      },
      {}
    );
  }, [dailyClasses]);

  const groupedClassesEntries = useMemo<[string, TimelineEvent[]][]>(() => {
    return Object.entries(groupedClasses) as [string, TimelineEvent[]][];
  }, [groupedClasses]);

  const isTodaySelected = isToday(selectedDate);
  const isPastDate = isBefore(startOfDay(selectedDate), startOfDay(new Date()));

  const dynamicTopTitle =
    userRole === "ADMIN"
      ? isTodaySelected
        ? "Aulas de hoje"
        : `Aulas do dia ${format(selectedDate, "dd/MM")}`
      : viewConfig.topSectionTitle;

  return (
    <div className="space-y-8 animate-in fade-in-50 w-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {dynamicTopTitle}
        </h2>

        {userRole === "ADMIN" ? (
          <AdminTodayClassesWidget
            dailyClasses={dailyClasses}
            onClassClick={handleOpenClassModal}
          />
        ) : (
          <ProfessorWeekWidget
            weeklyClasses={weeklyClasses}
            onClassClick={handleOpenClassModal}
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {viewConfig.middleSectionTitle}
        </h2>

        <MiddleWidget
          date={selectedDate}
          formattedCurrentMonth={formattedCurrentMonth}
          metrics={metrics}
          onMetricClick={handleOpenMetricModal}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Calendário</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="col-span-1 bg-card border rounded-2xl p-4 flex justify-center shadow-sm overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="rounded-md max-w-full"
              showOutsideDays={false}
              modifiers={{ hasClasses: daysWithClasses }}
              modifiersClassNames={{
                hasClasses:
                  "bg-primary/40 text-primary-foreground font-medium rounded-md shadow-sm",
              }}
            />
          </div>

          <div className="col-span-1 lg:col-span-2">
            {loadingDaily ? (
              <div className="bg-card border rounded-2xl p-6 shadow-sm flex justify-center py-20">
                <p className="text-muted-foreground animate-pulse font-medium">
                  Carregando agendamentos...
                </p>
              </div>
            ) : dailyClasses.length === 0 ? (
              <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
                <h3 className="text-xl font-medium mb-6 text-foreground shrink-0">
                  {date ? getFormattedHeaderDate(date) : "Selecione uma data"}
                </h3>

                <div className="flex-1 flex items-center justify-center">
                  <EmptyState
                    title="Nenhuma aula agendada"
                    description="Você não possui compromissos marcados para esta data."
                    action={
                      !isPastDate ? (
                        <Button className="h-11 rounded-xl px-5 text-sm font-semibold mt-4">
                          Agendar nova aula
                        </Button>
                      ) : undefined
                    }
                  />
                </div>
              </div>
            ) : viewConfig.calendarType === "TIMELINE" ? (
              <DailyTimeline
                date={selectedDate}
                events={dailyClasses}
                onEventClick={handleOpenClassModal}
              />
            ) : (
              <div className="bg-card border rounded-2xl p-6 shadow-sm min-h-[400px]">
                <h3 className="text-xl font-medium mb-6 text-foreground">
                  {date ? getFormattedHeaderDate(date) : "Selecione uma data"}
                </h3>

                <div className="space-y-4">
                  {groupedClassesEntries.map(([timeKey, classGroup]) => {
                    const firstClass = classGroup[0];

                    return (
                      <div
                        key={timeKey}
                        className="flex gap-4 items-start w-full"
                      >
                        <div className="w-16 shrink-0 flex flex-col items-center pt-2">
                          <span className="text-sm font-bold text-foreground">
                            {firstClass.startTime}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {firstClass.endTime}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-row gap-3 overflow-hidden">
                          {classGroup.map((classSession) => {
                            const colorClasses = getPastelColorTheme(
                              classSession.subtitle
                            );

                            return (
                              <button
                                key={classSession.id}
                                type="button"
                                onClick={() =>
                                  handleOpenClassModal(classSession)
                                }
                                className={cn(
                                  "flex flex-col justify-center p-3 rounded-xl flex-1 border border-border/20 border-l-4 shadow-sm transition-all overflow-hidden cursor-pointer hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left",
                                  colorClasses
                                )}
                              >
                                <p className="text-sm font-bold truncate w-full">
                                  {classSession.title}
                                </p>
                                <p className="text-xs opacity-80 mt-0.5 truncate w-full">
                                  {classSession.subtitle}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}