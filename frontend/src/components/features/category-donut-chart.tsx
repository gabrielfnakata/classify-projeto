import { useMemo } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { ChartTooltip } from "./chart-tooltip"
import type { CategoryDatum } from "./category-bar-chart"
import { VIZ_SERIES } from "@/lib/chart-colors"

const OTHER_LABEL = "Outras"
const OTHER_COLOR = "var(--muted-foreground)"

interface Slice extends CategoryDatum {
  color: string
}

interface CategoryDonutChartProps {
  data: CategoryDatum[]
  // Ordem estável das categorias: a cor acompanha a categoria, não a posição no ranking,
  // então trocar o filtro não repinta as fatias que continuam aparecendo.
  colorOrder: string[]
  seriesName: string
  centerLabel?: string
  maxSlices?: number
}

function buildSlices(data: CategoryDatum[], colorOrder: string[], maxSlices: number): Slice[] {
  const sorted = data.filter((d) => d.value > 0).sort((a, b) => b.value - a.value)
  const colored: Slice[] = []
  let otherTotal = 0

  sorted.forEach((datum) => {
    const colorIndex = colorOrder.indexOf(datum.label)
    const hasColor = colorIndex >= 0 && colorIndex < VIZ_SERIES.length
    const fitsAsSlice = colored.length < (sorted.length > maxSlices ? maxSlices - 1 : maxSlices)

    if (hasColor && fitsAsSlice) colored.push({ ...datum, color: VIZ_SERIES[colorIndex] })
    else otherTotal += datum.value
  })

  return otherTotal > 0 ? [...colored, { label: OTHER_LABEL, value: otherTotal, color: OTHER_COLOR }] : colored
}

export function CategoryDonutChart({
  data,
  colorOrder,
  seriesName,
  centerLabel = "Total",
  maxSlices = 6,
}: CategoryDonutChartProps) {
  const slices = useMemo(() => buildSlices(data, colorOrder, maxSlices), [data, colorOrder, maxSlices])
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className="@container">
      <div className="flex flex-col items-center justify-center gap-6 py-2 @md:flex-row @md:gap-8">
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v} ${centerLabel}`} />} />
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                name={seriesName}
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={slices.length > 1 ? 4 : 0}
                cornerRadius={8}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((slice) => (
                  <Cell key={slice.label} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold leading-none tabular-nums text-foreground">{total}</span>
            <span className="mt-1 text-xs text-muted-foreground">{centerLabel}</span>
          </div>
        </div>

        <ul className="w-full max-w-64 min-w-0 space-y-3 text-sm">
          {slices.map((slice) => (
            <li key={slice.label} className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="min-w-0 flex-1 truncate text-foreground">{slice.label}</span>
              <span className="tabular-nums font-semibold text-foreground">
                {total === 0 ? 0 : Math.round((slice.value / total) * 100)}%
              </span>
              <span className="w-6 text-right tabular-nums text-muted-foreground">{slice.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
