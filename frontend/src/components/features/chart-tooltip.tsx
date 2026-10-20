interface ChartTooltipPayloadItem {
  dataKey?: string | number
  name?: string | number
  value?: string | number
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: ChartTooltipPayloadItem[]
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
}

export function ChartTooltip({
  active,
  label,
  payload,
  valueFormatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-popover-foreground shadow-lg">
      {label !== undefined ? (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {labelFormatter ? labelFormatter(String(label)) : label}
        </p>
      ) : null}

      <div className="space-y-1">
        {payload.map((entry, index) => {
          const numericValue = typeof entry.value === "number" ? entry.value : Number(entry.value)

          return (
            <div key={`${entry.dataKey ?? index}`} className="flex items-center gap-2 text-sm">
              <span
                className="h-0.5 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-semibold text-foreground">
                {valueFormatter && !Number.isNaN(numericValue)
                  ? valueFormatter(numericValue)
                  : entry.value}
              </span>
              {entry.name ? <span className="text-muted-foreground">{entry.name}</span> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
