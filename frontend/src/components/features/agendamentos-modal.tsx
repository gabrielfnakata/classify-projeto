import { useState } from "react"
import { BookOpen, ChevronDown, Clock, MapPin, Pencil, User, Users } from "lucide-react"
import type { ReactNode } from "react"

import { StatusBadge } from "@/components/features/status-badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { ClassSession } from "@/shared/models/class-session"

interface AgendamentosModalProps {
  session: ClassSession | null
  onClose: () => void
  onEdit: () => void
}

const statusLabels: Record<ClassSession["status"], string> = {
  info: "Informação",
  success: "Confirmado",
  warning: "Pendente",
  danger: "Cancelado",
}

function DetailRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  )
}

function formatDisplayDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(dateStr + "T00:00:00"))
}

export function AgendamentosModal({ session, onClose, onEdit }: AgendamentosModalProps) {
  const [studentsOpen, setStudentsOpen] = useState(false)
  const students = session?._students ?? []
  const hasMultiple = students.length > 1

  return (
    <Sheet open={!!session} onOpenChange={(open) => { if (!open) { onClose(); setStudentsOpen(false) } }}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border p-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <SheetTitle className="text-base font-bold leading-snug">{session?.subject ?? ""}</SheetTitle>
            {session && <StatusBadge variant={session.status}>{statusLabels[session.status]}</StatusBadge>}
          </div>
          <SheetDescription>{session ? formatDisplayDate(session.date) : ""}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-auto p-4">
          {session && (
            <>
              <DetailRow icon={<Clock className="h-4 w-4" />} label="Horário">
                {session.startTime} – {session.endTime}
              </DetailRow>
              <DetailRow icon={<MapPin className="h-4 w-4" />} label="Sala">
                {session.room}
              </DetailRow>
              <DetailRow icon={<User className="h-4 w-4" />} label="Professor">
                {session.teacher}
              </DetailRow>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground"><Users className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-muted-foreground">Alunos</div>
                  {hasMultiple ? (
                    <button
                      type="button"
                      onClick={() => setStudentsOpen((o) => !o)}
                      className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {session.studentOrClass}
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", studentsOpen && "rotate-180")} />
                    </button>
                  ) : (
                    <div className="text-sm text-foreground">{session.studentOrClass}</div>
                  )}
                  {studentsOpen && (
                    <ul className="mt-2 space-y-1">
                      {students.map((s) => (
                        <li key={s.uuid} className="text-sm text-foreground pl-1">
                          • {s.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {session.description && (
                <DetailRow icon={<BookOpen className="h-4 w-4" />} label="Descrição">
                  {session.description}
                </DetailRow>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border p-4">
          <Button className="w-full" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Editar Agendamento
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
