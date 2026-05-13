import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectFieldProps {
  value?: string
  onChange?: (value: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
  className?: string
}

export function SelectField({
  value = "",
  onChange,
  options,
  placeholder = "Selecione uma opção",
  className,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-8 w-full min-w-0 items-center justify-between rounded-lg border border-input px-2.5 py-1 text-base md:text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-ring ring-3 ring-ring/50",
          selectedOption
            ? "bg-muted text-foreground"
            : "bg-background text-muted-foreground",
          className
        )}
      >
        <span className="truncate">
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-input bg-background text-foreground shadow-lg transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <div className="max-h-72 overflow-y-auto py-1">
          <button
            type="button"
            onClick={() => {
              onChange?.("")
              setOpen(false)
            }}
            className={cn(
              "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors",
              value === ""
                ? "bg-muted text-foreground font-semibold"
                : "hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{placeholder}</span>
            {value === "" ? <Check className="h-4 w-4" /> : null}
          </button>

          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-muted text-foreground font-semibold"
                    : "hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{option.label}</span>
                {isSelected ? <Check className="h-4 w-4" /> : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}