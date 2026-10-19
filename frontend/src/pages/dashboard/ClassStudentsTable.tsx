import { useState } from "react"

import { SectionTitle } from "@/components/features/section-title"
import { ContentCard } from "@/components/layout/content-card"
import { DataTable } from "@/components/common/data-table"
import { cn } from "@/lib/utils"
import type { StudentPerformanceRow } from "@/hooks/useClassPerformance"

interface ClassStudentsTableProps {
  rows: StudentPerformanceRow[] | null
  className?: string
}

function AttendanceMeter({ rate }: { rate: number | null }) {
  if (rate == null) return <span className="text-muted-foreground">—</span>

  return (
    <div className="flex items-center justify-end gap-2.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
      </div>
      <span className="w-10 text-right tabular-nums text-foreground">{rate}%</span>
    </div>
  )
}

export function ClassStudentsTable({ rows, className }: ClassStudentsTableProps) {
  // A lista já vem completa; a paginação é feita aqui mesmo.
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const totalPages = Math.max(1, Math.ceil((rows?.length ?? 0) / size))
  const pageRows = rows?.slice(page * size, (page + 1) * size) ?? []

  return (
    <ContentCard className={cn("flex flex-col", className)}>
      <SectionTitle title="Alunos da Turma" description="Nota média e frequência de cada aluno." className="mb-5" />

      {!rows ? (
        <p className="text-sm text-muted-foreground">Carregando desempenho dos alunos...</p>
      ) : (
        <DataTable
          data={pageRows}
          totalPages={totalPages}
          page={page}
          size={size}
          onPageChange={setPage}
          onSizeChange={(newSize) => {
            setSize(newSize)
            setPage(0)
          }}
          rowKey={(row) => row.uuid}
          emptyTitle="Turma sem alunos"
          emptyDescription="Adicione alunos a essa turma para ver o desempenho."
          className="max-h-96"
          columns={[
            { key: "name", header: "Aluno", cell: (row) => <span className="font-medium">{row.name}</span> },
            {
              key: "grade",
              header: "Nota",
              className: "w-20 text-right",
              cell: (row) => (
                <span className="tabular-nums">{row.averageGrade != null ? row.averageGrade.toFixed(1) : "—"}</span>
              ),
            },
            {
              key: "attendance",
              header: "Frequência",
              className: "w-40 text-right",
              cell: (row) => <AttendanceMeter rate={row.attendanceRate} />,
            },
          ]}
        />
      )}
    </ContentCard>
  )
}
