import { useState } from "react"
import { ChartColumn, Table2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ContentCard } from "@/components/layout/content-card"
import { EmptyState } from "@/components/common/empty-state"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { SectionTitle } from "./section-title"
import { cn } from "@/lib/utils"

interface ChartCardProps<T> {
  title: string
  description?: string
  badge?: React.ReactNode
  data: T[]
  columns: DataTableColumn<T>[]
  rowKey: (row: T, index: number) => string | number
  emptyTitle?: string
  emptyDescription?: string
  children: React.ReactNode
  className?: string
}

export function ChartCard<T>({
  title,
  description,
  badge,
  data,
  columns,
  rowKey,
  emptyTitle = "Sem dados no período",
  emptyDescription = "Ajuste os filtros para ver resultados.",
  children,
  className,
}: ChartCardProps<T>) {
  const [showTable, setShowTable] = useState(false)
  const hasData = data.length > 0

  return (
    <ContentCard className={cn("flex flex-col", className)}>
      <SectionTitle
        title={title}
        description={description}
        className="mb-5"
        action={
          <div className="flex items-center gap-2">
            {badge}
            {hasData ? (
              <Button variant="outline" size="sm" onClick={() => setShowTable((v) => !v)}>
                {showTable ? <ChartColumn /> : <Table2 />}
                {showTable ? "Ver gráfico" : "Ver tabela"}
              </Button>
            ) : null}
          </div>
        }
      />

      {!hasData ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : showTable ? (
        <DataTable data={data} columns={columns} rowKey={rowKey} />
      ) : (
        children
      )}
    </ContentCard>
  )
}
