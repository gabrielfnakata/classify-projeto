import { memo, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarCheck, CalendarPlus, CalendarSync, CalendarX, ClipboardCheck, Clock, Pencil, Trash2,
} from "lucide-react";

import api from "@/services/api";
import { SectionTitle } from "@/components/features/section-title";
import { StatusBadge } from "@/components/features/status-badge";
import { ScheduleForm } from "@/components/features/schedule-form";
import { ScheduleSeriesForm } from "@/components/features/schedule-series-form";
import { CancelSessionDialog } from "@/components/features/cancel-session-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/layout/content-card";
import { describeWeekdays, weekdaysOfDates } from "@/shared/utils/recurrence";
import { formatDMY, formatHHMM } from "@/shared/utils/date-formatter";
import { isCanceled, sessionEnd, sessionStart } from "@/shared/utils/class-session-helpers";
import { apiErrorMessage } from "@/shared/utils/api-error";
import { buildScheduleBlocks, type ScheduleBlock } from "@/shared/utils/schedule-blocks";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import type { BatchResultDTO } from "@/shared/dtos/class-session/BatchResultDTO";
import type { ScheduleFormState } from "@/shared/models/forms/ScheduleFormState";

interface ScheduledSessionsListProps {
  sessions: ClassSessionDTO[];
  onChanged: () => void;
  schedulePreset?: Partial<ScheduleFormState>;
  secondaryInfo?: (session: ClassSessionDTO) => string;
  title?: string;
  emptyDescription?: string;
}

/** Aulas do bloco que ainda vão acontecer — só elas podem ser canceladas ou reativadas. */
const upcomingOf = (block: ScheduleBlock): ClassSessionDTO[] => {
  const now = Date.now();
  return block.sessions.filter((session) => sessionStart(session).getTime() >= now);
};

interface BlockRowProps {
  block: ScheduleBlock;
  secondaryInfo?: (session: ClassSessionDTO) => string;
  onEdit: (block: ScheduleBlock) => void;
  onCancel: (block: ScheduleBlock) => void;
  onReactivate: (block: ScheduleBlock) => void;
  onDelete: (block: ScheduleBlock) => void;
}

const BlockRow = memo(function BlockRow({
  block, secondaryInfo, onEdit, onCancel, onReactivate, onDelete,
}: BlockRowProps) {
  const navigate = useNavigate();

  const first = block.sessions[0];
  const last = block.sessions[block.sessions.length - 1];
  const isSeries = block.recurrenceUuid !== null;
  const start = sessionStart(first);
  const timeRange = `${formatHHMM(start)}–${formatHHMM(sessionEnd(first))}`;

  const canceledCount = block.sessions.filter(isCanceled).length;
  const allCanceled = canceledCount === block.sessions.length;
  const upcoming = upcomingOf(block);
  const upcomingActive = upcoming.filter((session) => !isCanceled(session));
  const upcomingCanceled = upcoming.filter(isCanceled);

  const when = isSeries
    ? `${describeWeekdays(weekdaysOfDates(block.sessions.map(sessionStart)))} · ${timeRange} · ${formatDMY(start)} a ${formatDMY(sessionStart(last))}`
    : `${formatDMY(start)} · ${timeRange}`;
  const extra = secondaryInfo?.(first);
  const reason = block.sessions.find((session) => isCanceled(session) && session.cancellationReason)?.cancellationReason;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-border bg-panel-soft p-4 sm:flex-row sm:items-center sm:justify-between ${
        allCanceled ? "opacity-70" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {allCanceled
            ? <CalendarX className="h-4.5 w-4.5 text-muted-foreground" />
            : isSeries
              ? <CalendarSync className="h-4.5 w-4.5 text-primary" />
              : <Clock className="h-4.5 w-4.5 text-primary" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`font-semibold text-foreground ${allCanceled ? "line-through" : ""}`}>
              {first.subjectTeacher.subject.description}
            </p>
            {isSeries && <StatusBadge variant="info">{block.sessions.length} aulas</StatusBadge>}
            {canceledCount > 0 && (
              <StatusBadge variant="danger">
                {allCanceled ? "Cancelada" : `${canceledCount} cancelada${canceledCount > 1 ? "s" : ""}`}
              </StatusBadge>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {when}
            {extra ? ` · ${extra}` : ""}
            {reason ? ` · Motivo: ${reason}` : ""}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={allCanceled}
          title={allCanceled ? "Aula cancelada não tem chamada" : isSeries ? "Fazer chamada de todas as datas" : "Fazer chamada desta aula"}
          onClick={() =>
            navigate(isSeries ? `/attendance/series/${block.recurrenceUuid}` : `/attendance/${first.uuid}`)
          }
        >
          <ClipboardCheck className="h-4 w-4" />
          Chamada
        </Button>
        <Button
          variant="outline"
          size="sm"
          title={isSeries ? "Editar recorrência" : "Editar aula"}
          onClick={() => onEdit(block)}
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        {upcomingActive.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            title="Cancelar mantém a aula no histórico e libera o horário"
            onClick={() => onCancel(block)}
          >
            <CalendarX className="h-4 w-4" />
            Cancelar
            {upcomingActive.length > 1 ? ` (${upcomingActive.length})` : ""}
          </Button>
        )}
        {upcomingActive.length === 0 && upcomingCanceled.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            title="Voltar a agendar esta aula"
            onClick={() => onReactivate(block)}
          >
            <CalendarCheck className="h-4 w-4" />
            Reativar
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          title={isSeries ? "Excluir recorrência inteira (apaga do sistema)" : "Excluir aula (apaga do sistema)"}
          onClick={() => onDelete(block)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>
    </div>
  );
});

export function ScheduledSessionsList({
  sessions,
  onChanged,
  schedulePreset,
  secondaryInfo,
  title = "Aulas Agendadas",
  emptyDescription,
}: ScheduledSessionsListProps) {
  const blocks = useMemo(() => buildScheduleBlocks(sessions), [sessions]);

  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [seriesFormOpen, setSeriesFormOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<ClassSessionDTO[] | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ClassSessionDTO[] | null>(null);

  const openEdit = useCallback((block: ScheduleBlock) => {
    setEditingSeries(block.sessions);
    setSeriesFormOpen(true);
  }, []);

  /**
   * Uma requisição para o lote inteiro. O backend aplica o que dá e devolve a lista de falhas,
   * para uma recorrência de 15 aulas não virar 15 chamadas em sequência.
   */
  const runBatch = useCallback(async (
    targets: ClassSessionDTO[],
    request: (uuids: string[]) => Promise<{ data: BatchResultDTO }>,
    whatFailed: string
  ) => {
    setError(null);
    if (targets.length === 0) return;

    const byUuid = new Map(targets.map((session) => [session.uuid, session]));

    try {
      const { data: result } = await request(targets.map((session) => session.uuid));

      if (result.failures.length > 0) {
        const detail = result.failures.slice(0, 3).map((failure) => {
          const session = byUuid.get(failure.uuid);
          const when = session ? formatDMY(sessionStart(session)) : failure.uuid;
          return `${when}: ${failure.message}`;
        });
        setError(`${whatFailed} — ${detail.join(" | ")}`);
      }
    } catch (err: unknown) {
      setError(`${whatFailed} — ${apiErrorMessage(err, "a operação falhou")}`);
    }

    onChanged();
  }, [onChanged]);

  const confirmCancel = useCallback(async (reason: string) => {
    if (!cancelTarget) return;

    await runBatch(
      cancelTarget,
      (uuids) => api.put("/classsession/status/batch", {
        uuids,
        status: "CANCELED",
        cancellationReason: reason || null,
      }),
      "Algumas aulas não puderam ser canceladas"
    );
    setCancelTarget(null);
  }, [cancelTarget, runBatch]);

  const handleReactivate = useCallback((block: ScheduleBlock) =>
    runBatch(
      upcomingOf(block).filter(isCanceled),
      (uuids) => api.put("/classsession/status/batch", { uuids, status: "SCHEDULED", cancellationReason: null }),
      "Algumas aulas não puderam ser reativadas"
    ),
  [runBatch]);

  const handleDelete = useCallback((block: ScheduleBlock) =>
    runBatch(
      block.sessions,
      (uuids) => api.post("/classsession/delete/batch", { uuids }),
      "Algumas aulas não puderam ser excluídas"
    ),
  [runBatch]);

  const handleCancel = useCallback((block: ScheduleBlock) => {
    setCancelTarget(upcomingOf(block).filter((session) => !isCanceled(session)));
  }, []);

  const canSchedule = schedulePreset !== undefined;

  return (
    <ContentCard className="space-y-4">
      <SectionTitle
        title={title}
        className="mb-5 md:items-center"
        action={
          canSchedule ? (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <CalendarPlus className="h-4 w-4" />
              Agendar aula
            </Button>
          ) : undefined
        }
      />

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {blocks.length === 0 ? (
        <EmptyState
          title="Nenhuma aula agendada"
          description={
            emptyDescription ??
            (canSchedule ? 'Clique em "Agendar aula" para criar o primeiro agendamento.' : undefined)
          }
        />
      ) : (
        <div className="space-y-2">
          {blocks.map((block) => (
            <BlockRow
              key={block.key}
              block={block}
              secondaryInfo={secondaryInfo}
              onEdit={openEdit}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {canSchedule && (
        <ScheduleForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={onChanged}
          preset={schedulePreset}
        />
      )}

      <ScheduleSeriesForm
        open={seriesFormOpen}
        onClose={() => setSeriesFormOpen(false)}
        onSuccess={onChanged}
        sessions={editingSeries}
      />

      <CancelSessionDialog
        open={cancelTarget !== null}
        count={cancelTarget?.length ?? 0}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </ContentCard>
  );
}
