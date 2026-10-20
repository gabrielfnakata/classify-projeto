import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { VIZ_PRIMARY } from "@/lib/chart-colors"
import type { TrendPoint } from "@/shared/utils/session-analytics"

interface ScoreLineChartProps {
  data: TrendPoint[]
  seriesName: string
  maxScore?: number
  height?: number
}

// Cada ponto é uma avaliação: linha reta entre elas e escala fixa da nota (não a do maior valor).
export function ScoreLineChart({ data, seriesName, maxScore = 10, height = 260 }: ScoreLineChartProps) {
  const ticks = Array.from({ length: maxScore / 2 + 1 }, (_, i) => i * 2)

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={24}
            padding={{ left: 16, right: 16 }}
          />
          <YAxis
            domain={[0, maxScore]}
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
                valueFormatter={(v) => v.toFixed(1)}
                labelFormatter={(label) => data.find((d) => d.label === label)?.fullLabel ?? label}
              />
            }
          />
          <Line
            type="linear"
            dataKey="value"
            name={seriesName}
            stroke={VIZ_PRIMARY}
            strokeWidth={2}
            dot={{ r: 4, fill: VIZ_PRIMARY, strokeWidth: 2, stroke: "var(--card)" }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--card)" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
