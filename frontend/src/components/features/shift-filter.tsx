import { SegmentedTabs } from "./segmented-tabs"
import { SHIFT_OPTIONS, type ShiftValue } from "@/lib/shift-options"
import { cn } from "@/lib/utils"

interface ShiftFilterProps {
  value: ShiftValue
  onChange: (value: ShiftValue) => void
  className?: string
}

export function ShiftFilter({ value, onChange, className }: ShiftFilterProps) {
  return (
    <SegmentedTabs
      options={SHIFT_OPTIONS}
      value={value}
      onChange={(next) => onChange(next as ShiftValue)}
      size="sm"
      className={cn("w-72", className)}
    />
  )
}
