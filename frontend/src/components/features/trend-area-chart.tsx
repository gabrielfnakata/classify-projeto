import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { VIZ_PRIMARY } from "@/lib/chart-colors"

export interface TrendPoint {
  label: string
  fullLabel: string
  value: number
}

interface TrendAreaChartProps {
  data: TrendPoint[]
  seriesName: string
  height?: number
  valueFormatter?: (value: number) => string
}

export function TrendAreaChart({
  data,
  seriesName,
  height = 260,
  valueFormatter = (value) => `${value}`,
}: TrendAreaChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
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
            type="monotone"
            dataKey="value"
            name={seriesName}
            stroke={VIZ_PRIMARY}
            strokeWidth={2}
            fill={VIZ_PRIMARY}
            fillOpacity={0.1}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
