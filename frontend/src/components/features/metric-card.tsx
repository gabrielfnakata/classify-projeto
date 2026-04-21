import type { ReactNode } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
} from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

type MetricCardTone = "success" | "warning" | "danger" | "info" | "neutral"
type MetricCardVariant = "summary" | "detailed"

interface MetricCardProps {
  variant?: MetricCardVariant

  title?: string
  value: string
  subtitle?: string

  trendValue?: string
  trendDirection?: "up" | "down" | "neutral"

  statusLabel?: string
  tone?: MetricCardTone

  tooltipText?: string

  className?: string
  footer?: ReactNode
}

const toneCardClasses: Record<MetricCardTone, string> = {
  success:
    "border-[color:color-mix(in_oklab,var(--success)_45%,var(--border))] bg-[color:color-mix(in_oklab,var(--success)_12%,var(--card))]",
  warning:
    "border-[color:color-mix(in_oklab,var(--warning)_48%,var(--border))] bg-[color:color-mix(in_oklab,var(--warning)_12%,var(--card))]",
  danger:
    "border-[color:color-mix(in_oklab,var(--destructive)_40%,var(--border))] bg-[color:color-mix(in_oklab,var(--destructive)_10%,var(--card))]",
  info:
    "border-[color:color-mix(in_oklab,var(--info)_45%,var(--border))] bg-[color:color-mix(in_oklab,var(--info)_12%,var(--card))]",
  neutral: "border-border bg-card",
}

const toneValueClasses: Record<MetricCardTone, string> = {
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  danger: "text-destructive",
  info: "text-info-foreground",
  neutral: "text-foreground",
}

const toneTrendClasses: Record<MetricCardTone, string> = {
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  danger: "text-destructive",
  info: "text-info-foreground",
  neutral: "text-muted-foreground",
}

function TrendIcon({
  direction,
}: {
  direction?: "up" | "down" | "neutral"
}) {
  if (direction === "up") return <ArrowUpRight className="h-4 w-4" />
  if (direction === "down") return <ArrowDownRight className="h-4 w-4" />
  return <CircleHelp className="h-4 w-4" />
}

function StatusIcon({ tone }: { tone: MetricCardTone }) {
  if (tone === "success") return <CircleCheck className="h-4 w-4" />
  if (tone === "warning") return <CircleAlert className="h-4 w-4" />
  if (tone === "danger") return <CircleAlert className="h-4 w-4" />
  if (tone === "info") return <CircleHelp className="h-4 w-4" />
  return <CircleHelp className="h-4 w-4" />
}

export function MetricCard({
  variant = "detailed",
  title,
  value,
  subtitle,
  trendValue,
  trendDirection = "neutral",
  statusLabel,
  tone = "neutral",
  tooltipText,
  className,
  footer,
}: MetricCardProps) {
  if (variant === "summary") {
    return (
      <div
        className={cn(
          "rounded-2xl border px-6 py-5 text-center shadow-sm transition-colors",
          toneCardClasses[tone],
          className
        )}
      >
        <div className={cn("text-2xl font-bold tracking-tight", toneValueClasses[tone])}>
          {value}
        </div>

        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border shadow-sm transition-colors",
        toneCardClasses[tone],
        className
      )}
    >
      <div className="p-6">
        {title ? (
          <div className="mb-5 flex items-center gap-1.5">
            <h3 className="text-base font-medium text-foreground">{title}</h3>

            {tooltipText ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`Informações sobre ${title}`}
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[240px] text-sm">{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[2.1rem] font-bold leading-none tracking-tight text-foreground">
              {value}
            </div>

            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          {trendValue ? (
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-sm font-medium",
                trendDirection === "neutral"
                  ? "text-muted-foreground"
                  : toneTrendClasses[tone]
              )}
            >
              <span>{trendValue}</span>
              <TrendIcon direction={trendDirection} />
            </div>
          ) : null}
        </div>
      </div>

      {(statusLabel || footer) ? (
        <div className="border-t border-border/70 px-6 py-3.5">
          {footer ? (
            footer
          ) : (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <StatusIcon tone={tone} />
              <span>{statusLabel}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}