import { SegmentedTabs } from "./segmented-tabs"
import { PERIOD_OPTIONS, type PeriodValue } from "@/lib/period-options"
import { cn } from "@/lib/utils"

interface PeriodFilterProps {
  value: PeriodValue
  onChange: (value: PeriodValue) => void
  className?: string
}

export function PeriodFilter({ value, onChange, className }: PeriodFilterProps) {
  return (
    <SegmentedTabs
      options={PERIOD_OPTIONS.map(({ label, value }) => ({ label, value }))}
      value={value}
      onChange={(next) => onChange(next as PeriodValue)}
      size="sm"
      className={cn("w-52", className)}
    />
  )
}
