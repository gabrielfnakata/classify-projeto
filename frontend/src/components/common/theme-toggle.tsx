import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  collapsed?: boolean
  className?: string
}

export function ThemeToggle({
  collapsed = false,
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"))

  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={handleToggleTheme}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl border border-sidebar-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          className
        )}
        title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggleTheme}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          Modo claro
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          Modo escuro
        </>
      )}
    </button>
  )
}