import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MetricCard } from "@/components/features/metric-card"; 

export interface DashboardMetricsData {
  pendingReports: number;
  completedClasses: number;
  totalClassesToday: number;
}

interface MetricsWidgetProps {
  date: Date;
  formattedCurrentMonth: string;
  metrics: DashboardMetricsData;
  onMetricClick: (type: string) => void;
}

export function ProfessorMetricsWidget({ formattedCurrentMonth, metrics, onMetricClick }: MetricsWidgetProps) {
  return (
    <div className="flex flex-col sm:flex-row w-full gap-4">
      <button onClick={() => onMetricClick("reports")} className="flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl hover:opacity-90 transition-opacity">
        <MetricCard title="Você possui" value={metrics?.pendingReports?.toString() || "0"} subtitle="Relatórios pendentes" variant="summary" align="center" />
      </button>
      <button onClick={() => onMetricClick("classes")} className="flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl hover:opacity-90 transition-opacity">
        <MetricCard title="Aulas dadas" value={metrics?.completedClasses?.toString() || "0"} subtitle={formattedCurrentMonth} variant="summary" align="center" />
      </button>
    </div>
  );
}

export function AdminMetricsWidget({ date, metrics, onMetricClick }: MetricsWidgetProps) {
  const formattedDate = format(date || new Date(), "EEEE dd/MMM", { locale: ptBR });
  const formattedDateCap = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="flex flex-col sm:flex-row w-full gap-4">
      <button onClick={() => onMetricClick("reports")} className="flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl hover:opacity-90 transition-opacity">
        <MetricCard title="Existem" value={metrics?.pendingReports?.toString() || "0"} subtitle="relatórios pendentes" variant="summary" align="center" />
      </button>
      <button onClick={() => onMetricClick("classes")} className="flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl hover:opacity-90 transition-opacity">
        <MetricCard title="Aulas totais do dia" value={metrics?.totalClassesToday?.toString() || "0"} subtitle={formattedDateCap} variant="summary" align="center" />
      </button>
    </div>
  );
}