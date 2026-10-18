import { useMemo } from "react";

import useFetchList from "@/hooks/useFetchList";
import type { ClassSessionSummaryDTO, ScheduleGroupBy } from "@/shared/dtos/class-session/ClassSessionSummaryDTO";

export interface ScheduleSummary {
  upcoming: number;
  today: number;
}

const EMPTY: ClassSessionSummaryDTO[] = [];

/**
 * Contagem de aulas por disciplina, professor, sala ou turma, vinda pronta do backend.
 * Antes a listagem baixava a agenda inteira só para contar, o que custava quase 1 MB.
 */
export default function useScheduleSummary(groupBy: ScheduleGroupBy) {
  const { data } = useFetchList<ClassSessionSummaryDTO>(`/classsession/summary?groupBy=${groupBy}`);
  const rows = data ?? EMPTY;

  return useMemo(
    () => new Map<string, ScheduleSummary>(
      rows.map((row) => [row.uuid, { upcoming: row.upcoming, today: row.today }])
    ),
    [rows]
  );
}
