import { useState } from "react"
import { BookOpen, ChevronDown, Clock, MapPin, Pencil, Users } from "lucide-react"

import { StatusBadge } from "@/components/features/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ClassSession } from "@/shared/models/class-session"

interface AgendamentosModalProps {
  session: ClassSession | null
  onClose: () => void
  onEdit: () => void
}

const statusLabels: Record<ClassSession["status"], string> = {
  info: "Agendado",
  success: "Concluído",
  warning: "Pendente",
  danger: "Cancelado",
}

function formatDisplayDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(dateStr + "T00:00:00"))
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
      {initials}
    </div>
  )
}

export function AgendamentosModal({ session, onClose, onEdit }: AgendamentosModalProps) {
  const [studentsOpen, setStudentsOpen] = useState(false)
  const students = session?._students ?? []
  const hasMultiple = students.length > 1

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setStudentsOpen(false)
    }
  }

  return (
    <Dialog open={!!session} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">{session?.subject ?? ""}</DialogTitle>
              {session && (
                <div className="mt-0.5">
                  <StatusBadge variant={session.status}>{statusLabels[session.status]}</StatusBadge>
                </div>
              )}
            </div>
          </div>
          <DialogDescription className="mt-1">
            {session ? formatDisplayDate(session.date) : ""}
          </DialogDescription>
        </DialogHeader>

        {session && (
          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Professor
              </div>
              <div className="flex items-center gap-2">
                <Initials name={session.teacher} />
                <span className="text-sm text-foreground">{session.teacher}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Horário
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {session.startTime} – {session.endTime}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sala
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{session.room}</span>
                </div>
              </div>
            </div>

            {session.description && (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm italic text-muted-foreground">
                "{session.description}"
              </p>
            )}

            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Alunos
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                {hasMultiple ? (
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => setStudentsOpen((o) => !o)}
                      className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {session.studentOrClass}
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", studentsOpen && "rotate-180")} />
                    </button>
                    {studentsOpen && (
                      <ul className="mt-1.5 space-y-0.5 pl-0.5">
                        {students.map((s) => (
                          <li key={s.uuid} className="text-sm text-foreground">• {s.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-foreground">{session.studentOrClass}</span>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button className="flex-1" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Editar Agendamento
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Sair
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
