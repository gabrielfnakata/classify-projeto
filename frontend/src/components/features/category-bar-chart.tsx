import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { VIZ_PRIMARY } from "@/lib/chart-colors"

export interface CategoryDatum {
  label: string
  value: number
}

interface CategoryBarChartProps {
  data: CategoryDatum[]
  seriesName: string
  height?: number
  valueFormatter?: (value: number) => string
}

function truncateLabel(label: string, max = 16): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

export function CategoryBarChart({
  data,
  seriesName,
  height,
  valueFormatter = (value) => `${value}`,
}: CategoryBarChartProps) {
  const resolvedHeight = height ?? Math.max(140, data.length * 34)
  const longestLabel = data.reduce((max, d) => Math.max(max, truncateLabel(d.label).length), 0)
  const yAxisWidth = Math.min(128, Math.max(40, longestLabel * 7 + 16))

  return (
    <div style={{ height: resolvedHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 34, left: 8, bottom: 4 }}
          barCategoryGap="22%"
        >
          <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.6} />
          <XAxis type="number" allowDecimals={false} hide domain={[0, "dataMax"]} tickCount={4} />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
            tickFormatter={(value: string) => truncateLabel(value)}
            tick={{ fill: "var(--foreground)", fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: "var(--accent)", opacity: 0.5 }}
            content={<ChartTooltip valueFormatter={valueFormatter} />}
          />
          <Bar
            dataKey="value"
            name={seriesName}
            fill={VIZ_PRIMARY}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value) => valueFormatter(Number(value))}
              style={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
