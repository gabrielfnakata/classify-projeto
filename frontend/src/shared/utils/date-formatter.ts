export const formatYMD = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export const formatDateLabel = (d: Date): string =>
  new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(d)

export const formatMonthYearLabel = (d: Date): string =>
  new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d)
