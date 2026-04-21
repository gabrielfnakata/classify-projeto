import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
  className,
  contentClassName,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-foreground"
      >
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>

      <div
        className={cn(
          "rounded-xl transition-colors",
          error ? "ring-2 ring-destructive/25" : "",
          contentClassName
        )}
      >
        {children}
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}