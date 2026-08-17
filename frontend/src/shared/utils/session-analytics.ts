import type { ClassSessionDashboardDTO } from "@/shared/dtos/class-session/ClassSessionDashboardDTO"
import type { ShiftValue } from "@/lib/shift-options"
import { formatDateLabel, formatShortDate, formatYMD } from "./date-formatter"

function sessionStart(session: ClassSessionDashboardDTO): Date {
  return new Date(session.startTime as unknown as string)
}

// Período (intervalo de datas)

export function filterByPeriod<T>(items: T[], days: number, dateFn: (item: T) => Date): T[] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return items.filter((item) => {
    const date = dateFn(item)
    return date >= start && date <= end
  })
}

export function filterSessionsByPeriod(sessions: ClassSessionDashboardDTO[], days: number): ClassSessionDashboardDTO[] {
  return filterByPeriod(sessions, days, sessionStart)
}

// Tendência diária

export interface TrendPoint {
  label: string
  fullLabel: string
  value: number
}

export function buildDailyTrendFromDates(dates: Date[], days: number): TrendPoint[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const counts = new Map<string, number>()
  dates.forEach((date) => {
    const key = formatYMD(date)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  const points: TrendPoint[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)

    points.push({
      label: formatShortDate(day),
      fullLabel: formatDateLabel(day),
      value: counts.get(formatYMD(day)) ?? 0,
    })
  }

  return points
}

export function buildDailyTrend(sessions: ClassSessionDashboardDTO[], days: number): TrendPoint[] {
  return buildDailyTrendFromDates(sessions.map(sessionStart), days)
}

//Breakdown por categoria (ordenado por valor, com teto) 

export interface CategoryDatum {
  label: string
  value: number
}

export function buildCategoryBreakdown(
  sessions: ClassSessionDashboardDTO[],
  keyFn: (session: ClassSessionDashboardDTO) => string,
  limit = 6
): CategoryDatum[] {
  const counts = new Map<string, number>()

  sessions.forEach((session) => {
    const key = keyFn(session)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

// Breakdown com ordem fixa (dia da semana, turno — nunca ordenado por valor)

function buildOrderedBreakdown<T>(
  items: T[],
  order: string[],
  keyFn: (item: T) => string
): CategoryDatum[] {
  const counts = new Map(order.map((label) => [label, 0]))

  items.forEach((item) => {
    const key = keyFn(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  return order.map((label) => ({ label, value: counts.get(label) ?? 0 }))
}

// Dia da semana
export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function buildWeekdayBreakdown(sessions: ClassSessionDashboardDTO[]): CategoryDatum[] {
  return buildOrderedBreakdown(sessions, WEEKDAY_LABELS, (s) => WEEKDAY_LABELS[sessionStart(s).getDay()])
}

export function filterSessionsByWeekdays(sessions: ClassSessionDashboardDTO[], weekdays: number[]): ClassSessionDashboardDTO[] {
  if (weekdays.length === 0) return sessions
  return sessions.filter((s) => weekdays.includes(sessionStart(s).getDay()))
}

// Turno
const SHIFT_LABELS: Record<Exclude<ShiftValue, "all">, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  night: "Noite",
}

const SHIFT_ORDER: Exclude<ShiftValue, "all">[] = ["morning", "afternoon", "night"]

function sessionShift(session: ClassSessionDashboardDTO): Exclude<ShiftValue, "all"> {
  const hour = sessionStart(session).getHours()
  if (hour >= 6 && hour < 12) return "morning"
  if (hour >= 12 && hour < 18) return "afternoon"
  return "night"
}

export function buildShiftBreakdown(sessions: ClassSessionDashboardDTO[]): CategoryDatum[] {
  return buildOrderedBreakdown(
    sessions,
    SHIFT_ORDER.map((shift) => SHIFT_LABELS[shift]),
    (s) => SHIFT_LABELS[sessionShift(s)]
  )
}

export function filterSessionsByShift(sessions: ClassSessionDashboardDTO[], shift: ShiftValue): ClassSessionDashboardDTO[] {
  if (shift === "all") return sessions
  return sessions.filter((s) => sessionShift(s) === shift)
}
