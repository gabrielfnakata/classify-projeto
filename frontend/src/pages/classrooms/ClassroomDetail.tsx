import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import useFetchList from "@/hooks/useFetchList";
import useFetchOne from "@/hooks/useFetchOne";
import { EntityDetailLayout } from "@/components/features/entity-detail-layout";
import { ScheduledSessionsList } from "@/components/features/scheduled-sessions-list";
import { MetricCard } from "@/components/features/metric-card";
import { StatusBadge } from "@/components/features/status-badge";
import { formatYMD } from "@/shared/utils/date-formatter";
import { scheduleWindowQuery } from "@/shared/utils/schedule-window";
import {
  describeSessionTarget,
  isSessionActiveAt,
  sessionAttendeeCount,
  sessionStart,
} from "@/shared/utils/class-session-helpers";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import type { ScheduleFormState } from "@/shared/models/forms/ScheduleFormState";

const EMPTY_SESSIONS: ClassSessionDTO[] = [];
const CLOCK_TICK_MS = 60_000;

type OccupancyTone = "neutral" | "success" | "warning" | "danger";

function occupancyToneFor(occupancy: number, capacity: number): OccupancyTone {
  if (occupancy === 0) return "neutral";
  if (occupancy > capacity) return "danger";
  if (occupancy >= capacity * 0.8) return "warning";
  return "success";
}

export default function ClassroomDetail() {
  const { uuid = "" } = useParams<{ uuid: string }>();

  const { data: classroom, loading } = useFetchOne<ClassroomDTO>(`/classroom/${uuid}`);
  const { data: sessionsData, refetch: refetchSessions } = useFetchList<ClassSessionDTO>(
    `/classsession/filter?classroomUuid=${uuid}&${scheduleWindowQuery()}`
  );
  const sessions = sessionsData ?? EMPTY_SESSIONS;

  // "Agora" avança a cada minuto para a ocupação acompanhar o relógio sem recarregar a página.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  // Uma passada só sobre as aulas da sala calcula tudo que os cards precisam.
  const { occupancy, todayCount, upcomingCount } = useMemo(() => {
    const today = formatYMD(new Date(now));
    let occupancy = 0;
    let todayCount = 0;
    let upcomingCount = 0;

    for (const session of sessions) {
      const start = sessionStart(session);
      if (isSessionActiveAt(session, now)) occupancy += sessionAttendeeCount(session);
      if (formatYMD(start) === today) todayCount += 1;
      if (start.getTime() >= now) upcomingCount += 1;
    }

    return { occupancy, todayCount, upcomingCount };
  }, [sessions, now]);

  const capacity = classroom?.capacity ?? 0;
  const occupancyTone = occupancyToneFor(occupancy, capacity);

  const schedulePreset = useMemo<Partial<ScheduleFormState>>(() => ({ classroomId: uuid }), [uuid]);

  const secondaryInfo = useCallback((session: ClassSessionDTO) =>
    `Prof. ${session.subjectTeacher.employee.name} · ${describeSessionTarget(session)}`,
  []);

  return (
    <EntityDetailLayout
      title={classroom?.name ?? "Sala"}
      description={classroom ? `Capacidade para ${classroom.capacity} aluno(s)` : undefined}
      badge={classroom?.isDisabled ? <StatusBadge variant="danger">Desativada</StatusBadge> : undefined}
      backTo="/classrooms"
      loading={loading && !classroom}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard variant="summary" value={String(capacity)} subtitle="Capacidade máxima" tone="info" />
        <MetricCard
          variant="summary"
          value={`${occupancy}/${capacity}`}
          subtitle="Ocupação agora"
          tone={occupancyTone}
        />
        <MetricCard variant="summary" value={String(todayCount).padStart(2, "0")} subtitle="Aulas hoje" />
        <MetricCard variant="summary" value={String(upcomingCount).padStart(2, "0")} subtitle="Aulas futuras" />
      </div>

      <ScheduledSessionsList
        sessions={sessions}
        onChanged={refetchSessions}
        schedulePreset={schedulePreset}
        secondaryInfo={secondaryInfo}
      />
    </EntityDetailLayout>
  );
}
