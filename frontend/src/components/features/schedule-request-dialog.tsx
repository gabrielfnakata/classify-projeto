import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, Loader2 } from "lucide-react";

import { TimeSelect } from "@/components/common/time-select";
import { TeacherAvailabilityHint } from "@/components/features/teacher-availability-hint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/useFetch";
import useFetchList from "@/hooks/useFetchList";
import api from "@/services/api";
import type { TeacherAvailabilityDTO } from "@/shared/dtos/employees/TeacherAvailabilityDTO";
import type { PaginationDTO } from "@/shared/dtos/pagination/PaginationDTO";
import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO";
import { apiErrorMessage } from "@/shared/utils/api-error";
import { formatYMD } from "@/shared/utils/date-formatter";

const MAX_MESSAGE_LENGTH = 1000;

interface ScheduleRequestDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ScheduleRequestDialog({ open, onClose }: ScheduleRequestDialogProps) {
  const { data: subjectTeachersData, loading } = useFetch<PaginationDTO<SubjectTeacherDTO>>(open ? "/subjectteacher" : null);
  const links = useMemo(() => subjectTeachersData?.content ?? [], [subjectTeachersData]);

  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubjectId(""); setTeacherId(""); setDate(""); setStartTime(""); setEndTime("");
    setMessage(""); setError(null); setSent(false); setPending(false);
  }, [open]);

  const subjects = useMemo(
    () => [...new Map(links.map((l) => [l.subject.uuid, l.subject])).values()]
      .sort((a, b) => a.description.localeCompare(b.description, "pt-BR")),
    [links]
  );
  const teachers = useMemo(
    () => links.filter((l) => l.subject.uuid === subjectId).map((l) => l.employee)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [links, subjectId]
  );
  const subjectTeacher = links.find((l) => l.subject.uuid === subjectId && l.employee.uuid === teacherId);

  const { data: availabilityData } = useFetchList<TeacherAvailabilityDTO>(
    teacherId ? `/employee/${teacherId}/availability` : null
  );

  const today = formatYMD(new Date());
  const canSend = Boolean(subjectTeacher && date && startTime && endTime && endTime > startTime) && !pending;

  const handleSend = async () => {
    if (!subjectTeacher) return;
    setPending(true);
    setError(null);
    try {
      await api.post(
        "/student/me/schedule-requests",
        {
          subjectTeacherUuid: subjectTeacher.uuid,
          startTime: `${date}T${startTime}:00`,
          endTime: `${date}T${endTime}:00`,
          message: message.trim(),
        },
        { skipExceptionModal: true }
      );
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Não foi possível enviar a solicitação. Tente novamente."));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col p-0">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CalendarPlus className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle>Solicitar agendamento</DialogTitle>
          </div>
          <DialogDescription className="mt-1">
            O professor recebe seu pedido por e-mail e, se aceitar, a aula entra na sua agenda.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-success-foreground" />
            <p className="text-sm font-medium text-foreground">Solicitação enviada!</p>
            <p className="text-xs text-muted-foreground">
              Você vai receber um e-mail quando o professor responder.
            </p>
          </div>
        ) : loading !== false ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto scrollbar-slim p-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Disciplina</Label>
                <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setTeacherId(""); }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent position="popper" className="max-h-72">
                    {subjects.map((s) => <SelectItem key={s.uuid} value={s.uuid}>{s.description}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Professor</Label>
                <Select value={teacherId} onValueChange={setTeacherId} disabled={!subjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={subjectId ? "Selecionar..." : "Escolha a disciplina"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-72">
                    {teachers.map((t) => <SelectItem key={t.uuid} value={t.uuid}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Início</Label>
                <TimeSelect
                  value={startTime}
                  onChange={(v) => { setStartTime(v); if (endTime && endTime <= v) setEndTime(""); }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fim</Label>
                <TimeSelect value={endTime} startFrom={startTime} disabled={!startTime} onChange={setEndTime} />
              </div>
            </div>

            {teacherId && (
              <TeacherAvailabilityHint
                blocks={availabilityData ?? []}
                date={date}
                startTime={startTime}
                endTime={endTime}
                recurringWeekdays={[]}
              />
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Recado para o professor (opcional)</Label>
              <Textarea
                value={message}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={3}
                placeholder="Ex.: quero revisar frações antes da prova."
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {sent ? (
            <Button className="flex-1" type="button" onClick={onClose}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1" type="button" disabled={pending} onClick={onClose}>
                Cancelar
              </Button>
              <Button className="flex-1" type="button" disabled={!canSend} onClick={handleSend}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar solicitação
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
