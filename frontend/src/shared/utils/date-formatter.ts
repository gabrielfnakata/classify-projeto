export const formatYMD = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export const formatDateLabel = (d: Date): string =>
  new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(d)

export const formatMonthYearLabel = (d: Date): string =>
  new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d)

export const formatFullDateLabel = (d: Date): string =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d)

export const toDate = (value: unknown): Date => new Date(value as string)

export const formatHHMM = (raw: unknown): string => {
  const d = toDate(raw)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}
