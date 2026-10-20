import { ChartCard } from "@/components/features/chart-card"
import { ScoreLineChart } from "@/components/features/score-line-chart"
import { TrendAreaChart } from "@/components/features/trend-area-chart"
import type { TrendPoint } from "@/shared/utils/session-analytics"

interface ClassTrendChartsProps {
  gradeTrend: TrendPoint[]
  studentCountTrend: TrendPoint[]
}

export function ClassTrendCharts({ gradeTrend, studentCountTrend }: ClassTrendChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Média da Turma por Avaliação"
        description="Média das notas dos alunos em cada formulário corrigido."
        data={gradeTrend}
        emptyTitle="Sem notas ainda"
        emptyDescription="A média aparecerá aqui assim que os formulários da turma forem corrigidos."
      >
        <ScoreLineChart data={gradeTrend} seriesName="Média" />
      </ChartCard>

      <ChartCard
        title="Alunos na Turma"
        description="Entradas e saídas de alunos ao longo do tempo."
        data={studentCountTrend}
        emptyTitle="Sem histórico"
        emptyDescription="O histórico aparecerá aqui conforme alunos entrarem ou saírem da turma."
      >
        <TrendAreaChart data={studentCountTrend} seriesName="Alunos" curve="stepAfter" />
      </ChartCard>
    </div>
  )
}
