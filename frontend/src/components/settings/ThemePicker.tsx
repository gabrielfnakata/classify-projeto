import type { ComponentType } from "react"
import { Check, Monitor, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { ACCENTS, THEMES, type Accent, type Theme } from "@/shared/models/theme"

const THEME_ICONS: Record<Theme, ComponentType<{ className?: string }>> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

interface ThemePickerProps {
  themes?: typeof THEMES
  theme: Theme
  accent?: Accent
  onThemeChange: (theme: Theme) => void
  onAccentChange?: (accent: Accent) => void
}

export function ThemePicker({ theme, themes = THEMES, accent, onThemeChange, onAccentChange }: ThemePickerProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Modo</p>
        <div className="flex flex-wrap gap-3">
          {themes.map(({ value, label }) => {
            const Icon = THEME_ICONS[value]
            const selected = theme === value

            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => onThemeChange(value)}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors hover:cursor-pointer sm:w-40",
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {accent && onAccentChange && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Cor de destaque</p>
          <div className="flex flex-wrap gap-4">
            {ACCENTS.map(({ value, label }) => {
              const selected = accent === value

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onAccentChange(value)}
                  className="flex flex-col items-center gap-2 hover:cursor-pointer"
                >
                  <span
                    data-accent={value}
                    style={{ background: "oklch(0.55 var(--accent-chroma) var(--accent-hue))" }}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full border-2 text-white transition-all",
                      selected ? "border-foreground ring-2 ring-ring/40" : "border-transparent"
                    )}
                  >
                    {selected && <Check className="size-5" />}
                  </span>
                  <span className={cn("text-sm", selected ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
