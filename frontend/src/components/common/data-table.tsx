import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { EmptyState } from "./empty-state"
import DataTablePagination from "./data-table-pagination"

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
  totalPages?: number
  page?: number
  size?: number
  onPageChange: (page: number) => void,
  onSizeChange: (size: number) => void
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyAction,
  className,
  totalPages = 1,
  page = 0,
  size = 10,
  onPageChange,
  onSizeChange
}: DataTableProps<T>) {
  // TODO: Remover bg-card, colocar bg-table
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-table text-card-foreground shadow-sm",
        className
      )}
    >
      {data.length > 0 ? (
        <>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-table-foreground">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-left font-bold text-table-header",
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

          <div className="flex shrink-0 justify-end border-t border-border px-4 py-3">
            <DataTablePagination
              totalPages={totalPages}
              page={page}
              size={size}
              onPageChange={onPageChange}
              onSizeChange={onSizeChange}
            />
          </div>
        </>
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
