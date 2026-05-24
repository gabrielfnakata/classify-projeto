import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { MetricCard } from "@/components/features/metric-card"

export interface DashboardMetricsData {
  pendingReports: number
  completedClasses: number
  totalClassesToday: number
}

interface MetricsWidgetProps {
  date: Date
  formattedCurrentMonth: string
  metrics: DashboardMetricsData
  onMetricClick: (type: string) => void
}

export function ProfessorMetricsWidget({
  formattedCurrentMonth,
  metrics,
  onMetricClick,
}: MetricsWidgetProps) {
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      <button
        onClick={() => onMetricClick("reports")}
        className="flex-1 rounded-lg text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MetricCard
          title="Você possui"
          value={metrics.pendingReports.toString()}
          subtitle="Relatórios pendentes"
          variant="summary"
          align="center"
        />
      </button>
      <button
        onClick={() => onMetricClick("classes")}
        className="flex-1 rounded-lg text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MetricCard
          title="Aulas na data"
          value={metrics.completedClasses.toString()}
          subtitle={formattedCurrentMonth}
          variant="summary"
          align="center"
        />
      </button>
    </div>
  )
}

export function AdminMetricsWidget({ date, metrics, onMetricClick }: MetricsWidgetProps) {
  const formattedDate = format(date, "EEEE dd/MMM", { locale: ptBR })
  const formattedDateCap = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      <button
        onClick={() => onMetricClick("reports")}
        className="flex-1 rounded-lg text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MetricCard
          title="Existem"
          value={metrics.pendingReports.toString()}
          subtitle="relatórios pendentes"
          variant="summary"
          align="center"
        />
      </button>
      <button
        onClick={() => onMetricClick("classes")}
        className="flex-1 rounded-lg text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MetricCard
          title="Aulas totais do dia"
          value={metrics.totalClassesToday.toString()}
          subtitle={formattedDateCap}
          variant="summary"
          align="center"
        />
      </button>
    </div>
  )
}
