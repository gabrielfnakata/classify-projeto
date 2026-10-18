import { formatYMD } from "@/shared/utils/date-formatter"

export const DEFAULT_REPORT_CONTENT = "Aula agendada."

export function generateRecurringDates(startDate: string, untilDate: string, weekdays: number[]): string[] {
  const dates: string[] = []
  if (!startDate || !untilDate || weekdays.length === 0) return dates

  const current = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${untilDate}T00:00:00`)
  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) return dates

  // Trava de segurança: sem isso um "repetir até" digitado errado (ex: ano
  // trocado) geraria centenas de aulas sem ninguém perceber.
  let guard = 0
  while (current <= end && guard < MAX_RECURRING_DATES) {
    if (weekdays.includes(current.getDay())) {
      dates.push(formatYMD(current))
      guard += 1
    }
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export const MAX_RECURRING_DATES = 200

const WEEKDAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]

export function describeWeekdays(weekdays: number[]): string {
  if (weekdays.length === 0) return ""
  const sorted = [...weekdays].sort((a, b) => a - b)
  const names = sorted.map((d) => WEEKDAY_NAMES[d])
  if (names.length === 1) return `toda ${names[0]}`
  return `toda ${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`
}

// Descobre em quais dias da semana uma série já existente acontece, pra poder
// estender a recorrência mantendo o mesmo padrão.
export function weekdaysOfDates(dates: Date[]): number[] {
  return [...new Set(dates.map((d) => d.getDay()))].sort((a, b) => a - b)
}

const dmy = (ymd: string) => ymd.split("-").reverse().join("/")

export function describeDateList(dates: string[]): string {
  if (dates.length === 0) return ""
  if (dates.length <= 4) return dates.map(dmy).join(", ")
  return `${dates.slice(0, 3).map(dmy).join(", ")} … ${dmy(dates[dates.length - 1])}`
}
