import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";

interface ConfirmationDialogProps {
    open?: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
}

export default function ConfirmationDialog({message, open, onOpenChange}: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle> Confirmação </DialogTitle>
                    <DialogDescription> {message} </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            variant="secondary"
                        >
                            Fechar
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
