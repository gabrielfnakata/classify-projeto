export type ShiftValue = "all" | "morning" | "afternoon" | "night"

export const SHIFT_OPTIONS: { label: string; value: ShiftValue }[] = [
  { label: "Todos", value: "all" },
  { label: "Manhã", value: "morning" },
  { label: "Tarde", value: "afternoon" },
  { label: "Noite", value: "night" },
]
