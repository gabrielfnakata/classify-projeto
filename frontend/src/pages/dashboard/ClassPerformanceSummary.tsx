import { MetricCard } from "@/components/features/metric-card"
import { useClassPerformance } from "@/hooks/useClassPerformance"
import { ClassStudentsTable } from "./ClassStudentsTable"
import { ClassTrendCharts } from "./ClassTrendCharts"

interface ClassPerformanceSummaryProps {
  classUuid: string
}

export function ClassPerformanceSummary({ classUuid }: ClassPerformanceSummaryProps) {
  const { rows, averageGrade, averageAttendance, gradeTrend, studentCountTrend } = useClassPerformance(classUuid)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          variant="summary"
          value={averageGrade != null ? averageGrade.toFixed(1) : "—"}
          subtitle="Nota Média da Turma"
          tone="neutral"
        />
        <MetricCard
          variant="summary"
          value={averageAttendance != null ? `${averageAttendance}%` : "—"}
          subtitle="Frequência Média"
          tone="warning"
        />
        <MetricCard variant="summary" value={String(rows?.length ?? 0)} subtitle="Alunos" tone="info" />
      </div>

      <ClassTrendCharts gradeTrend={gradeTrend} studentCountTrend={studentCountTrend} />

      <ClassStudentsTable rows={rows} />
    </div>
  )
}
