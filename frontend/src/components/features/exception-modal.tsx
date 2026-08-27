import { useEffect, useState } from "react";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Dialog, DialogContent } from "@/components/ui/dialog";

type ExceptionModalPayload = {
  code?: string;
  message?: string;
  status?: number;
};

export function ExceptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<ExceptionModalPayload>({});

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<ExceptionModalPayload>).detail;
      setPayload(detail ?? {});
      setIsOpen(true);
    };

    window.addEventListener("exception-modal:show", handleOpen);

    return () => {
      window.removeEventListener("exception-modal:show", handleOpen);
    };
  }, []);

  const message = payload.message ?? "Não foi possível concluir a operação.";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        className="top-[30%] w-auto min-w-[320px] max-w-[420px] border-0 bg-transparent p-0 shadow-none"
      >
        <div className="relative">
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-700 transition hover:bg-red-100"
              aria-label="Fechar mensagem de erro"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </DialogPrimitive.Close>

          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <p className="font-semibold">Mensagem</p>
            <p className="mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}