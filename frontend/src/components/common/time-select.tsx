import { useMemo } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDuration } from "@/shared/utils/date-formatter";
import { cn } from "@/lib/utils";

const STEP_MINUTES = 15;
const MINUTES_IN_DAY = 24 * 60;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toHHMM = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Horário de início: limita a lista ao que vem depois dele e mostra a duração de cada opção. */
  startFrom?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Seletor de horário de 15 em 15 minutos. No campo de fim (com `startFrom`), cada opção
 * mostra quanto tempo a aula teria — o mesmo padrão da agenda do Google.
 */
export function TimeSelect({ value, onChange, startFrom, disabled, className }: TimeSelectProps) {
  const options = useMemo(() => {
    const start = startFrom ? toMinutes(startFrom) : null;
    // Com início definido a lista começa um passo depois dele; senão, cobre o dia inteiro.
    const first = start === null ? 0 : start + STEP_MINUTES;
    const list: { value: string; label: string }[] = [];

    for (let minutes = first; minutes < MINUTES_IN_DAY; minutes += STEP_MINUTES) {
      const time = toHHMM(minutes);
      list.push({
        value: time,
        label: start === null ? time : `${time} (${formatDuration(minutes - start)})`,
      });
    }

    // Horários antigos fora da grade (ex.: 09:20 vindo do banco) continuam selecionáveis.
    if (value && !list.some((option) => option.value === value)) {
      const current = toMinutes(value);
      const label = start === null || current <= start ? value : `${value} (${formatDuration(current - start)})`;
      list.push({ value, label });
      list.sort((a, b) => toMinutes(a.value) - toMinutes(b.value));
    }

    return list;
  }, [startFrom, value]);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder="--:--" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
