import { BookOpen, CalendarSync, ClipboardCheck, Clock, MapPin, Pencil, Users } from "lucide-react"
import { useNavigate } from "react-router"

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
import { groupRecurrenceUuid, type SessionGroup } from "@/shared/utils/session-grouping"

interface ScheduleModalProps {
  group: SessionGroup | null
  classroomNames: Map<string, string>
  onClose: () => void
  onEdit: () => void
  onEditSeries: () => void
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

function groupStatus(group: SessionGroup): SessionStatus {
  return new Date(group.sessions[0].endTime as unknown as string) < new Date() ? "success" : "info"
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

export function ScheduleModal({ group, classroomNames, onClose, onEdit, onEditSeries }: ScheduleModalProps) {
  const navigate = useNavigate()
  const primary = group?.sessions[0] ?? null

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const status = group ? groupStatus(group) : "info"

  const handleAttendance = () => {
    if (!group) return
    const [first, ...rest] = group.sessions
    const query = rest.length > 0 ? `?group=${rest.map((s) => s.uuid).join(",")}` : ""
    navigate(`/attendance/${first.uuid}${query}`)
  }

  return (
    <Dialog open={!!group} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">{primary?.subjectTeacher.subject.description ?? ""}</DialogTitle>
              {primary && (
                <div className="mt-0.5">
                  <StatusBadge variant={status}>{statusLabels[status]}</StatusBadge>
                </div>
              )}
            </div>
          </div>
          <DialogDescription className="mt-1">
            {primary ? formatDisplayDate(primary.startTime) : ""}
          </DialogDescription>
        </DialogHeader>

        {group && primary && (
          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Professor
              </div>
              <div className="flex items-center gap-2">
                <Initials name={primary.subjectTeacher.employee.name} />
                <span className="text-sm text-foreground">{primary.subjectTeacher.employee.name}</span>
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
                    {toHHMM(primary.startTime)} – {toHHMM(primary.endTime)}
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
                    {resolveClassroomName(classroomNames, primary.classroomUuid)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {primary.classDTO ? "Turma" : group.sessions.length > 1 ? `Alunos (${group.sessions.length})` : "Aluno"}
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {primary.classDTO ? (
                  <span className="text-sm text-foreground">{primary.classDTO.name}</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {group.sessions.map((s) => (
                      <span
                        key={s.uuid}
                        className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                      >
                        {s.student?.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-wrap">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleAttendance}
          >
            <ClipboardCheck className="h-4 w-4" />
            Fazer Chamada
          </Button>
          <Button className="flex-1" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Editar Agendamento
          </Button>
          {group && groupRecurrenceUuid(group) && (
            <Button variant="outline" className="flex-1" onClick={onEditSeries}>
              <CalendarSync className="h-4 w-4" />
              Editar Recorrência
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
