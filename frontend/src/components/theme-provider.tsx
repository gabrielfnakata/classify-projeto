/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import {
  DEFAULT_ACCENT,
  isAccent,
  isTheme,
  type Accent,
  type Theme,
  type ThemePreference,
} from "@/shared/models/theme"

type ResolvedTheme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  accent: Accent
  defaults: ThemePreference
  setDefaults: (defaults: ThemePreference) => void
  isCustomized: boolean
  resetToDefaults: () => void
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const DEFAULTS_STORAGE_KEY = "default-theme"

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

function readStoredTheme(key: string) {
  const value = localStorage.getItem(key)

  return isTheme(value) ? value : null
}

function parseDefaults(value: string | null, fallback: ThemePreference) {
  if (value === null) {
    return fallback
  }

  try {
    const parsed = JSON.parse(value)
    if (isTheme(parsed?.theme) && isAccent(parsed?.accent)) {
      return { theme: parsed.theme, accent: parsed.accent }
    }
  } catch {
    return fallback
  }

  return fallback
}

function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return "dark"
  }

  return "light"
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']"
  )
  if (editableParent) {
    return true
  }

  return false
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const fallbackDefaults = React.useMemo<ThemePreference>(
    () => ({ theme: defaultTheme, accent: DEFAULT_ACCENT }),
    [defaultTheme]
  )
  const [storedTheme, setStoredTheme] = React.useState<Theme | null>(() =>
    readStoredTheme(storageKey)
  )
  const [defaults, setDefaultsState] = React.useState<ThemePreference>(() =>
    parseDefaults(localStorage.getItem(DEFAULTS_STORAGE_KEY), fallbackDefaults)
  )

  const theme = storedTheme ?? defaults.theme
  const accent = defaults.accent
  const isCustomized = storedTheme !== null

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme)
      setStoredTheme(nextTheme)
    },
    [storageKey]
  )

  const setDefaults = React.useCallback((nextDefaults: ThemePreference) => {
    localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(nextDefaults))
    setDefaultsState(nextDefaults)
  }, [])

  const resetToDefaults = React.useCallback(() => {
    localStorage.removeItem(storageKey)
    setStoredTheme(null)
  }, [storageKey])

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      const root = document.documentElement
      const resolvedTheme =
        nextTheme === "system" ? getSystemTheme() : nextTheme
      const restoreTransitions = disableTransitionOnChange
        ? disableTransitionsTemporarily()
        : null

      root.classList.remove("light", "dark")
      root.classList.add(resolvedTheme)

      if (restoreTransitions) {
        restoreTransitions()
      }
    },
    [disableTransitionOnChange]
  )

  React.useEffect(() => {
    applyTheme(theme)

    if (theme !== "system") {
      return undefined
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      applyTheme("system")
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, applyTheme])

  React.useEffect(() => {
    const root = document.documentElement

    if (accent === DEFAULT_ACCENT) {
      root.removeAttribute("data-accent")
      return
    }

    root.setAttribute("data-accent", accent)
  }, [accent])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      const nextTheme =
        theme === "dark"
          ? "light"
          : theme === "light"
            ? "dark"
            : getSystemTheme() === "dark"
              ? "light"
              : "dark"

      setTheme(nextTheme)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [theme, setTheme])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }

      if (event.key === storageKey) {
        setStoredTheme(isTheme(event.newValue) ? event.newValue : null)
        return
      }

      if (event.key === DEFAULTS_STORAGE_KEY) {
        setDefaultsState(parseDefaults(event.newValue, fallbackDefaults))
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [fallbackDefaults, storageKey])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      accent,
      defaults,
      setDefaults,
      isCustomized,
      resetToDefaults,
    }),
    [
      theme,
      setTheme,
      accent,
      defaults,
      setDefaults,
      isCustomized,
      resetToDefaults,
    ]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
