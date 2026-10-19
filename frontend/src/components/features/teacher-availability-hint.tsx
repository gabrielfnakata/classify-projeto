import { CalendarClock, TriangleAlert } from "lucide-react";

import { describeAvailability, fitsAvailability, weekdayByJsDay } from "@/shared/utils/weekdays";
import type { TeacherAvailabilityDTO } from "@/shared/dtos/employees/TeacherAvailabilityDTO";

interface TeacherAvailabilityHintProps {
  blocks: TeacherAvailabilityDTO[];
  date: string;       // "yyyy-mm-dd"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  recurringWeekdays: number[]; // índices JS, só quando "repetir" está ligado
}

// Abaixo do seletor de professor no agendamento: mostra quando ele atende e avisa
// antes de enviar se a data/horário (ou os dias da recorrência) caem fora disso.
export function TeacherAvailabilityHint({ blocks, date, startTime, endTime, recurringWeekdays }: TeacherAvailabilityHintProps) {
  if (blocks.length === 0) return null;

  const problems: string[] = [];

  if (date && startTime && endTime) {
    const jsDay = new Date(`${date}T00:00:00`).getDay();
    if (!fitsAvailability(blocks, jsDay, startTime, endTime))
      problems.push(`${weekdayByJsDay(jsDay).label} ${startTime}–${endTime} está fora do horário do professor.`);
  }

  const badDays = recurringWeekdays.filter(
    (jsDay) => startTime && endTime && !fitsAvailability(blocks, jsDay, startTime, endTime)
  );
  if (badDays.length > 0)
    problems.push(`Na recorrência: ${badDays.map((d) => weekdayByJsDay(d).short).join(", ")} fora do horário do professor.`);

  return (
    <div className="space-y-1.5">
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>Atende: {describeAvailability(blocks)}</span>
      </p>
      {problems.map((problem) => (
        <p key={problem} className="flex items-start gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs text-warning-foreground">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {problem}
        </p>
      ))}
    </div>
  );
}
