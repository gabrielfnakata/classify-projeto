import { ContentCard } from "@/components/layout/content-card"
import { EmptyState } from "@/components/common/empty-state"
import { SectionTitle } from "./section-title"
import { cn } from "@/lib/utils"

interface ChartCardProps<T> {
  title: string
  description?: string
  badge?: React.ReactNode
  data: T[]
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
  emptyTitle = "Sem dados no período",
  emptyDescription = "Ajuste os filtros para ver resultados.",
  children,
  className,
}: ChartCardProps<T>) {
  return (
    <ContentCard className={cn("flex flex-col", className)}>
      <SectionTitle title={title} description={description} className="mb-5" action={badge} />

      {data.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : children}
    </ContentCard>
  )
}
