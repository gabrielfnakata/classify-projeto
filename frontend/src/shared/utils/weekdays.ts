import type { TeacherAvailabilityDTO } from "@/shared/dtos/employees/TeacherAvailabilityDTO";

export type WeekdayKey =
  | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface Weekday {
  key: WeekdayKey;
  label: string;
  short: string;
  jsDay: number; // índice de Date#getDay() (0 = domingo)
}

// Ordem de exibição: segunda a domingo, como o backend (java.time.DayOfWeek).
export const WEEKDAYS: Weekday[] = [
  { key: "MONDAY", label: "Segunda", short: "Seg", jsDay: 1 },
  { key: "TUESDAY", label: "Terça", short: "Ter", jsDay: 2 },
  { key: "WEDNESDAY", label: "Quarta", short: "Qua", jsDay: 3 },
  { key: "THURSDAY", label: "Quinta", short: "Qui", jsDay: 4 },
  { key: "FRIDAY", label: "Sexta", short: "Sex", jsDay: 5 },
  { key: "SATURDAY", label: "Sábado", short: "Sáb", jsDay: 6 },
  { key: "SUNDAY", label: "Domingo", short: "Dom", jsDay: 0 },
];

const BY_KEY = new Map(WEEKDAYS.map((day) => [day.key, day]));
const BY_JS_DAY = new Map(WEEKDAYS.map((day) => [day.jsDay, day]));

export const weekdayByKey = (key: WeekdayKey): Weekday => BY_KEY.get(key)!;
export const weekdayByJsDay = (jsDay: number): Weekday => BY_JS_DAY.get(jsDay)!;

// "07:30:00" → "07:30"
export const toHHMM = (time: string): string => time.slice(0, 5);

export const formatTimeRange = (start: string, end: string): string => `${toHHMM(start)}–${toHHMM(end)}`;

// Dias (índice JS) em que o professor tem pelo menos um bloco.
export function availableJsDays(blocks: TeacherAvailabilityDTO[]): Set<number> {
  return new Set(blocks.map((block) => weekdayByKey(block.weekday).jsDay));
}

// A aula (dia JS + "HH:mm" de início e fim) cabe em algum bloco? Sem blocos, tudo é permitido.
export function fitsAvailability(
  blocks: TeacherAvailabilityDTO[],
  jsDay: number,
  startHHMM: string,
  endHHMM: string
): boolean {
  if (blocks.length === 0) return true;

  return blocks.some(
    (block) =>
      weekdayByKey(block.weekday).jsDay === jsDay &&
      toHHMM(block.startTime) <= startHHMM &&
      endHHMM <= toHHMM(block.endTime)
  );
}

// "seg 07:30–12:40, ter 13:30–18:40"
export function describeAvailability(blocks: TeacherAvailabilityDTO[]): string {
  return blocks
    .map((block) => `${weekdayByKey(block.weekday).short.toLowerCase()} ${formatTimeRange(block.startTime, block.endTime)}`)
    .join(", ");
}
