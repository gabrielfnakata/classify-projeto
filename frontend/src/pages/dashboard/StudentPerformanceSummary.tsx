import { useMemo } from "react"

import useFetch from "@/hooks/useFetch"
import { MetricCard } from "@/components/features/metric-card"
import { SectionTitle } from "@/components/features/section-title"
import { ContentCard } from "@/components/layout/content-card"
import type { AttendanceGetDTO } from "@/shared/dtos/attendance/AttendanceGetDTO"
import type { FormDTO } from "@/shared/dtos/form/FormDTO"
import { averageScore, getGradedForms, overallAttendanceRate } from "@/shared/utils/performance-metrics"

interface StudentPerformanceSummaryProps {
  studentUuid: string
  studentName: string
}

export function StudentPerformanceSummary({ studentUuid, studentName }: StudentPerformanceSummaryProps) {
  const { data: attendance } = useFetch<AttendanceGetDTO[]>(`/student/${studentUuid}/attendance`)
  const { data: forms } = useFetch<FormDTO[]>(`/student/${studentUuid}/forms`)

  const gradedForms = useMemo(() => getGradedForms(forms ?? []), [forms])
  const averageGrade = useMemo(() => averageScore(gradedForms), [gradedForms])
  const attendanceRate = useMemo(() => overallAttendanceRate(attendance ?? []), [attendance])

  return (
    <ContentCard>
      <SectionTitle title={`Desempenho de ${studentName}`} className="mb-5" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricCard
          variant="summary"
          value={averageGrade != null ? averageGrade.toFixed(1) : "—"}
          subtitle="Nota Média"
          tone="neutral"
        />
        <MetricCard
          variant="summary"
          value={attendanceRate != null ? `${attendanceRate}%` : "—"}
          subtitle="Frequência Geral"
          tone="warning"
        />
        <MetricCard variant="summary" value={String(gradedForms.length)} subtitle="Formulários Corrigidos" tone="info" />
      </div>

      <div className="mt-5 space-y-2">
        {gradedForms.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum formulário corrigido ainda.</p>
        ) : (
          gradedForms.map((form) => (
            <div
              key={form.uuid}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-panel-soft px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{form.title}</p>
                <p className="text-xs text-muted-foreground">Prof. {form.teacherName}</p>
              </div>
              <span className="text-base font-semibold text-foreground">{form.score?.toFixed(1)}</span>
            </div>
          ))
        )}
      </div>
    </ContentCard>
  )
}
