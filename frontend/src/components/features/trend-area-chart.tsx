import { useId } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { VIZ_PRIMARY } from "@/lib/chart-colors"
import type { TrendPoint } from "@/shared/utils/session-analytics"

interface TrendAreaChartProps {
  data: TrendPoint[]
  seriesName: string
  height?: number
  valueFormatter?: (value: number) => string
  // "stepAfter" para contagens que mudam de uma vez (ex.: alunos na turma).
  curve?: "monotone" | "stepAfter"
}

export function TrendAreaChart({
  data,
  seriesName,
  height = 260,
  valueFormatter = (value) => `${value}`,
  curve = "monotone",
}: TrendAreaChartProps) {
  const gradientId = `trend-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  // Contagens pequenas: escala inteira até o máximo, sem sobrar eixo vazio.
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const smallScale = maxValue <= 5
  const ticks = smallScale ? Array.from({ length: maxValue + 1 }, (_, i) => i) : undefined

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VIZ_PRIMARY} stopOpacity={0.35} />
              <stop offset="100%" stopColor={VIZ_PRIMARY} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            domain={smallScale ? [0, maxValue] : [0, "auto"]}
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={
              <ChartTooltip
                valueFormatter={valueFormatter}
                labelFormatter={(label) => data.find((d) => d.label === label)?.fullLabel ?? label}
              />
            }
          />
          <Area
            type={curve}
            dataKey="value"
            name={seriesName}
            stroke={VIZ_PRIMARY}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
