import { BookOpen, Clock, MapPin, Pencil, Users } from "lucide-react"

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
import { formatYMD } from "@/shared/utils/date-formatter"
import { resolveClassroomName } from "@/shared/utils/class-session-helpers"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"

interface ScheduleModalProps {
  session: ClassSessionDTO | null
  classroomNames: Map<string, string>
  onClose: () => void
  onEdit: () => void
}

type SessionStatus = "info" | "success"

const statusLabels: Record<SessionStatus, string> = {
  info: "Agendado",
  success: "Concluído",
}

const pad = (n: number) => String(n).padStart(2, "0")

function toHHMM(raw: unknown): string {
  const d = new Date(raw as string)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function sessionStatus(dto: ClassSessionDTO): SessionStatus {
  return new Date(dto.endTime as unknown as string) < new Date() ? "success" : "info"
}

function studentOrClass(dto: ClassSessionDTO): string {
  if (dto.student) return dto.student.name
  if (dto.classDTO) return dto.classDTO.name
  return "—"
}

function formatDisplayDate(raw: unknown): string {
  const date = new Date(raw as string)
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(formatYMD(date) + "T00:00:00"))
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

export function ScheduleModal({ session, classroomNames, onClose, onEdit }: ScheduleModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const status = session ? sessionStatus(session) : "info"

  return (
    <Dialog open={!!session} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">{session?.subjectTeacher.subject.description ?? ""}</DialogTitle>
              {session && (
                <div className="mt-0.5">
                  <StatusBadge variant={status}>{statusLabels[status]}</StatusBadge>
                </div>
              )}
            </div>
          </div>
          <DialogDescription className="mt-1">
            {session ? formatDisplayDate(session.startTime) : ""}
          </DialogDescription>
        </DialogHeader>

        {session && (
          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Professor
              </div>
              <div className="flex items-center gap-2">
                <Initials name={session.subjectTeacher.employee.name} />
                <span className="text-sm text-foreground">{session.subjectTeacher.employee.name}</span>
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
                    {toHHMM(session.startTime)} – {toHHMM(session.endTime)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sala
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {resolveClassroomName(classroomNames, session.classroomUuid)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Alunos
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground">{studentOrClass(session)}</span>
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
