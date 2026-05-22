import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { EmptyState } from "./empty-state"

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  cell: (row: T, index: number) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  rowKey: (row: T, index: number) => string | number
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyAction,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden w-full h-full rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-panel-strong/70">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left font-semibold text-muted-foreground",
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr
                    key={String(rowKey(row, index))}
                    className="border-t border-border transition-colors hover:bg-accent/50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn("px-4 py-3 align-middle", column.className)}
                      >
                        {column.cell(row, index)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {emptyTitle}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
          <EmptyState 
            className="w-full h-full"
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        )}
    </div>
  )
}