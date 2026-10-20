export type PeriodValue = "7" | "30" | "90"

export const PERIOD_OPTIONS: { label: string; value: PeriodValue; days: number }[] = [
  { label: "7 dias", value: "7", days: 7 },
  { label: "30 dias", value: "30", days: 30 },
  { label: "90 dias", value: "90", days: 90 },
]

export function periodDays(value: PeriodValue): number {
  return PERIOD_OPTIONS.find((option) => option.value === value)?.days ?? 30
}
