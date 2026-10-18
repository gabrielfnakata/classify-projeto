import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "./chart-tooltip"
import { VIZ_PRIMARY } from "@/lib/chart-colors"

export interface ColumnDatum {
  label: string
  fullLabel?: string
  value: number
}

interface ColumnChartProps {
  data: ColumnDatum[]
  seriesName: string
  height?: number
  valueFormatter?: (value: number) => string
}

// Rótulo em cima de cada coluna só quando são poucas; numa série diária vira ruído.
const MAX_LABELED_COLUMNS = 12

export function ColumnChart({ data, seriesName, height = 260, valueFormatter = (value) => `${value}` }: ColumnChartProps) {
  const showValues = data.length <= MAX_LABELED_COLUMNS
  // Contagens pequenas (ex.: 0 ou 1 aula por dia): escala inteira até o máximo, sem sobrar eixo vazio.
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const smallScale = maxValue <= 5
  const ticks = smallScale ? Array.from({ length: maxValue + 1 }, (_, i) => i) : undefined

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: showValues ? 20 : 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={16}
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
            cursor={{ fill: "var(--accent)", opacity: 0.5 }}
            content={
              <ChartTooltip
                valueFormatter={valueFormatter}
                labelFormatter={(label) => data.find((d) => d.label === label)?.fullLabel ?? label}
              />
            }
          />
          <Bar
            dataKey="value"
            name={seriesName}
            fill={VIZ_PRIMARY}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
            isAnimationActive={false}
          >
            {showValues && (
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value) => valueFormatter(Number(value))}
                style={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
