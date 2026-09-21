import { useCallback, useMemo, useState } from "react";
import { CalendarClock, Plus, X } from "lucide-react";

import api from "@/services/api";
import useFetchList from "@/hooks/useFetchList";
import { SectionTitle } from "@/components/features/section-title";
import { WeekdayPicker } from "@/components/features/weekday-picker";
import { EmptyState } from "@/components/common/empty-state";
import { TimeSelect } from "@/components/common/time-select";
import { ContentCard } from "@/components/layout/content-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/shared/utils/api-error";
import { WEEKDAYS, formatTimeRange, weekdayByJsDay } from "@/shared/utils/weekdays";
import type { TeacherAvailabilityCreateDTO, TeacherAvailabilityDTO } from "@/shared/dtos/employees/TeacherAvailabilityDTO";

interface TeacherAvailabilitySectionProps {
  employeeUuid: string;
  editing: boolean;
}

const EMPTY: TeacherAvailabilityDTO[] = [];
const WEEKDAYS_DEFAULT = [1, 2, 3, 4, 5]; // seg–sex, em índices de Date#getDay()

// Quadro "Disponibilidade" da tela do professor: blocos por dia da semana, com edição no card.
export function TeacherAvailabilitySection({ employeeUuid, editing }: TeacherAvailabilitySectionProps) {
  const { data, refetch } = useFetchList<TeacherAvailabilityDTO>(`/employee/${employeeUuid}/availability`);
  const blocks = data ?? EMPTY;

  const [weekdays, setWeekdays] = useState<number[]>(WEEKDAYS_DEFAULT);
  const [startTime, setStartTime] = useState("07:30");
  const [endTime, setEndTime] = useState("12:00");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Blocos agrupados na ordem seg→dom; só os dias com algum bloco aparecem.
  const byDay = useMemo(
    () => WEEKDAYS
      .map((day) => ({ day, blocks: blocks.filter((block) => block.weekday === day.key) }))
      .filter((group) => group.blocks.length > 0),
    [blocks]
  );

  const canAdd = weekdays.length > 0 && startTime !== "" && endTime !== "" && startTime < endTime;

  // Um POST por dia marcado. Se um falhar (ex.: sobreposição só naquele dia), os outros
  // continuam valendo e a mensagem diz quais ficaram de fora.
  const handleAdd = useCallback(async () => {
    setError(null);
    setPending(true);

    const failures: string[] = [];
    for (const jsDay of weekdays) {
      const day = weekdayByJsDay(jsDay);
      const payload: TeacherAvailabilityCreateDTO = { weekday: day.key, startTime, endTime };
      try {
        await api.post(`/employee/${employeeUuid}/availability`, payload);
      } catch (err: unknown) {
        failures.push(`${day.short}: ${apiErrorMessage(err, "falhou")}`);
      }
    }

    if (failures.length > 0)
      setError(`Não foi possível adicionar em ${failures.length} dia(s) — ${failures.join(" | ")}`);

    refetch();
    setPending(false);
  }, [employeeUuid, weekdays, startTime, endTime, refetch]);

  const handleRemove = useCallback(async (uuid: string) => {
    setError(null);
    setPending(true);

    try {
      await api.delete(`/employee/${employeeUuid}/availability/${uuid}`, { data: {} });
      refetch();
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Não foi possível remover o horário."));
    } finally {
      setPending(false);
    }
  }, [employeeUuid, refetch]);

  return (
    <ContentCard className="space-y-4">
      <SectionTitle
        title="Disponibilidade"
        description={editing ? "Sem horários cadastrados, o professor pode ser agendado em qualquer dia." : undefined}
        className="mb-5 md:items-center"
      />

      {editing && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-panel-soft p-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Dias</Label>
            <WeekdayPicker value={weekdays} onChange={setWeekdays} className="flex-wrap" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Início</Label>
            <TimeSelect
              value={startTime}
              className="w-28"
              onChange={(v) => {
                setStartTime(v);
                if (endTime && endTime <= v) setEndTime("");
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Fim</Label>
            <TimeSelect
              value={endTime}
              startFrom={startTime}
              disabled={!startTime}
              className="w-36"
              onChange={setEndTime}
            />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!canAdd || pending}>
            <Plus className="h-4 w-4" />
            {weekdays.length > 1 ? `Adicionar em ${weekdays.length} dias` : "Adicionar"}
          </Button>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {byDay.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Sem horários cadastrados"
          description="Este professor pode ser agendado em qualquer dia e horário."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {byDay.map(({ day, blocks: dayBlocks }) => (
            <div key={day.key} className="rounded-xl border border-border bg-panel-soft px-4 py-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {day.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dayBlocks.map((block) => (
                  <span
                    key={block.uuid}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {formatTimeRange(block.startTime, block.endTime)}
                    {editing && (
                      <button
                        type="button"
                        title="Remover horário"
                        disabled={pending}
                        onClick={() => handleRemove(block.uuid)}
                        className="ml-0.5 rounded-full hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ContentCard>
  );
}
