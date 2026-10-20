import type { AuditDTO } from "@/shared/dtos/audit/AuditDTO";
import {useState} from "react";
import api from "@/services/api.ts";
import {Undo2} from "lucide-react";
import ConfirmUndoDialog from "@/components/dialogs/ConfirmUndoDialog";

interface UndoDeleteButtonProps {
    row: AuditDTO;
    onDone: () => void;
}

export default function UndoDeleteButton({ row, onDone }: UndoDeleteButtonProps) {
    const [open, setOpen] = useState(false);

    const handleConfirm = async () => {
        const url = row.tableName === 'EMPLOYEE' ? 'employee' : 'student';
        try {
            await api.put(`${url}/undo-delete/${row.registerId}`);
            setOpen(false);
            onDone();
        } catch (error) {
            console.error("Erro ao desfazer exclusão", error);
        }
    };

    return (
        <>
            <Undo2
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(true)}
            />
            <ConfirmUndoDialog
                open={open}
                onOpenChange={setOpen}
                onConfirm={handleConfirm}
            />
        </>
    );
}
