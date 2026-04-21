import { MoreHorizontal } from "lucide-react"
import { Avatar } from "@/components/common/avatar"
import { cn } from "@/lib/utils"

interface EntityCardProps {
  name: string
  subtitle?: string
  description?: string
  seed?: string | number
  className?: string
}

export function EntityCard({
  name,
  subtitle,
  description,
  seed,
  className,
}: EntityCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-panel-soft px-5 py-4 text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar
          name={name}
          seed={seed ?? name}
          size="lg"
          className="ring-2 ring-background/80"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-foreground">
                {name}
              </h3>

              {subtitle ? (
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {subtitle}
                </p>
              ) : null}

              {description ? (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}