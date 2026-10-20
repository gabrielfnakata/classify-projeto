import type { AuditDTO } from "@/shared/dtos/audit/AuditDTO";
import {useState} from "react";
import api from "@/services/api.ts";
import {Undo2} from "lucide-react";
import ConfirmUndoDialog from "@/components/dialogs/ConfirmUndoDialog";
import { StatusBadge } from "@/components/features/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RestoreStatus } from "@/shared/models/enums/restore-status";

interface UndoDeleteButtonProps {
    row: AuditDTO;
    onDone: () => void;
}

export default function UndoDeleteButton({ row, onDone }: UndoDeleteButtonProps) {
    const [open, setOpen] = useState(false);

    if (row.restoreStatus === undefined) {
        return <span className="text-muted-foreground">-</span>;
    }

    if (row.restoreStatus === RestoreStatus.RESTORED) {
        return <StatusBadge variant="muted">Restaurado</StatusBadge>;
    }

    if (row.restoreStatus === RestoreStatus.UNAVAILABLE) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span><StatusBadge variant="danger">Indisponível</StatusBadge></span>
                </TooltipTrigger>
                <TooltipContent>O registro foi excluído definitivamente e não pode ser restaurado.</TooltipContent>
            </Tooltip>
        );
    }

    const handleConfirm = async () => {
        const url = row.tableName === 'EMPLOYEE' ? 'employee' : 'student';
        try {
            await api.put(`${url}/undo-delete/${row.registerId}`);
        } catch (error) {
            console.error("Erro ao desfazer exclusão", error);
        } finally {
            setOpen(false);
            onDone();
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
