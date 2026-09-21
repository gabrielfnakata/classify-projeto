import { useEffect, useState } from "react";
import { CalendarX, Loader2 } from "lucide-react";

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

interface CancelSessionDialogProps {
  open: boolean;
  /** Quantas aulas serão canceladas (recorrência cancela várias de uma vez). */
  count: number;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

// Pergunta o motivo antes de cancelar. Cancelar mantém a aula no histórico;
// quem quer apagar de vez usa o botão Excluir.
export function CancelSessionDialog({ open, count, onClose, onConfirm }: CancelSessionDialogProps) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setPending(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0">
        <DialogHeader className="border-b border-border p-5 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/15">
              <CalendarX className="h-4 w-4 text-warning-foreground" />
            </div>
            <DialogTitle>{count > 1 ? `Cancelar ${count} aulas` : "Cancelar aula"}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            A aula fica registrada como cancelada em vez de ser excluída.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 p-5">
          <Label className="text-xs text-muted-foreground">Motivo (opcional)</Label>
          <Input
            value={reason}
            maxLength={255}
            placeholder="Ex.: feriado, professor ausente..."
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" className="flex-1" type="button" disabled={pending} onClick={onClose}>
            Voltar
          </Button>
          <Button className="flex-1" type="button" disabled={pending} onClick={handleConfirm}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancelar aula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
