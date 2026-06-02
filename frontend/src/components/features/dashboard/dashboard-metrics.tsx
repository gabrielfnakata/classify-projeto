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
}

export function ProfessorMetricsWidget({
  formattedCurrentMonth,
  metrics,
}: MetricsWidgetProps) {
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      <div className="flex-1 rounded-lg text-left">
        <MetricCard
          title="Você possui"
          value={metrics.pendingReports.toString()}
          subtitle="Relatórios pendentes"
          variant="summary"
          align="center"
        />
      </div>
      <div className="flex-1 rounded-lg text-left">
        <MetricCard
          title="Aulas na data"
          value={metrics.completedClasses.toString()}
          subtitle={formattedCurrentMonth}
          variant="summary"
          align="center"
        />
      </div>
    </div>
  )
}

export function AdminMetricsWidget({ date, metrics }: MetricsWidgetProps) {
  const formattedDate = format(date, "EEEE dd/MMM", { locale: ptBR })
  const formattedDateCap = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      <div className="flex-1 rounded-lg text-left">
        <MetricCard
          title="Existem"
          value={metrics.pendingReports.toString()}
          subtitle="relatórios pendentes"
          variant="summary"
          align="center"
        />
      </div>
      <div className="flex-1 rounded-lg text-left">
        <MetricCard
          title="Aulas totais do dia"
          value={metrics.totalClassesToday.toString()}
          subtitle={formattedDateCap}
          variant="summary"
          align="center"
        />
      </div>
    </div>
  )
}
