import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO";
import { formatFullDateLabel, toDate } from "@/shared/utils/date-formatter";

const MAX_SUBJECT_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 5000;

interface TeacherMessageDialogProps {
  session: ClassSessionDTO | null;
  open: boolean;
  onClose: () => void;
}

export function TeacherMessageDialog({ session, open, onClose }: TeacherMessageDialogProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open && session) {
      setSubject(`Aula de ${session.subjectTeacher.subject.description} - ${formatFullDateLabel(toDate(session.startTime))}`);
      setMessage("");
      setError(null);
      setSent(false);
      setPending(false);
    }
  }, [open, session]);

  const handleSend = async () => {
    if (!session) return;
    setPending(true);
    setError(null);
    try {
      await api.post(
        "/student/me/messages",
        { sessionUuid: session.uuid, subject: subject.trim(), message: message.trim() },
        { skipExceptionModal: true }
      );
      setSent(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setPending(false);
    }
  };

  const canSend = subject.trim().length > 0 && message.trim().length > 0 && !pending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle>Mensagem ao professor</DialogTitle>
          </div>
          <DialogDescription className="mt-1">
            {session ? `Para ${session.subjectTeacher.employee.name}. A resposta chega no seu e-mail.` : ""}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-success-foreground" />
            <p className="text-sm font-medium text-foreground">Mensagem enviada!</p>
            <p className="text-xs text-muted-foreground">O professor vai receber por e-mail.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assunto</Label>
              <Input
                value={subject}
                maxLength={MAX_SUBJECT_LENGTH}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mensagem</Label>
              <Textarea
                value={message}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={6}
                placeholder="Escreva sua dúvida ou recado para o professor..."
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
            <Button className="flex-1" type="button" onClick={onClose}>
              Fechar
            </Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1" type="button" disabled={pending} onClick={onClose}>
                Cancelar
              </Button>
              <Button className="flex-1" type="button" disabled={!canSend} onClick={handleSend}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
