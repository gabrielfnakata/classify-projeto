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
  align?: "left" | "center" // Nova propriedade para forçar o alinhamento

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
  align,
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
  
  // Define o alinhamento padrão com base na variante para não quebrar telas antigas
  const isCentered = align === "center" || (variant === "summary" && align !== "left");

  if (variant === "summary") {
    return (
      <div
        className={cn(
          "flex flex-col justify-center rounded-2xl border px-6 py-5 shadow-sm transition-colors",
          isCentered ? "items-center text-center" : "items-start text-left",
          toneCardClasses[tone],
          className
        )}
      >
        {/* Agora o summary também aceita título! */}
        {title ? (
          <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
        ) : null}

        <div className={cn("text-2xl font-bold tracking-tight", toneValueClasses[tone])}>
          {value}
        </div>

        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    )
  }

  // Renderização da variante Detailed
  return (
    <div
      className={cn(
        "overflow-hidden flex flex-col rounded-2xl border shadow-sm transition-colors",
        toneCardClasses[tone],
        className
      )}
    >
      <div className={cn("p-6 flex flex-col flex-1", isCentered && "items-center text-center")}>
        {title ? (
          <div className={cn("mb-5 flex items-center gap-1.5", isCentered && "justify-center")}>
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

        <div className={cn("flex w-full gap-4", isCentered ? "flex-col items-center justify-center" : "items-start justify-between")}>
          <div className={cn(isCentered && "flex flex-col items-center")}>
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
        <div className={cn("border-t border-border/70 px-6 py-3.5", isCentered && "flex justify-center text-center")}>
          {footer ? (
            footer
          ) : (
            <div className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", isCentered && "justify-center")}>
              <StatusIcon tone={tone} />
              <span>{statusLabel}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}