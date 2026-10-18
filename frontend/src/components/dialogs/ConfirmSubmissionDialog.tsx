import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";

interface ConfirmSubmissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export default function ConfirmSubmissionDialog({open, onOpenChange, onConfirm}: ConfirmSubmissionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Deseja enviar o formulário?</DialogTitle>
                    <DialogDescription>
                        Depois de enviado, não será possível alterar as suas respostas. Se ainda precisar revisar
                        algo, cancele e continue respondendo.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end">
                    <DialogClose asChild>
                        <Button className="rounded-xl text-sm font-semibold hover:cursor-pointer" variant="secondary">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button
                        className="rounded-xl text-sm font-semibold hover:cursor-pointer hover:bg-button-highlight
                        transition-colors duration-200"
                        onClick={onConfirm}
                    >
                        Enviar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
