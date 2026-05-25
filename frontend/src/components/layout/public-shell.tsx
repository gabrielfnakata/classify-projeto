import type { ReactNode } from "react"

interface PublicShellProps {
  children: ReactNode
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-background text-foreground">
      {children}
    </div>
  )
}