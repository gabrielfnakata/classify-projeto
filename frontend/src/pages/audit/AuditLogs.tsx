import { useState } from "react";
import { Eye, History } from "lucide-react";
import { type DataTableColumn } from "@/components/common/data-table";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import { StatusBadge } from "@/components/features/status-badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { AuditDTO } from "@/shared/dtos/audit/AuditDTO";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import {AuditTables, normalizeTableName, TABLE_NAMES} from "@/shared/models/enums/audit-tables.ts";

const OPERATION_OPTIONS: { value: string; label: string }[] = [
    { value: "INSERT", label: "INSERT (Criação)" },
    { value: "UPDATE", label: "UPDATE (Edição)" },
    { value: "DELETE", label: "DELETE (Exclusão)" },
];

const filtersConfig: FilterConfig[] = [
    {
        name: "tableName",
        inputType: "select",
        placeholder: "Selecione a tabela",
        options: TABLE_NAMES.filter((table) => table.value !== "ALL"),
        width: 33,
    },
    {
        name: "operation",
        inputType: "select",
        placeholder: "Selecione a operação",
        options: OPERATION_OPTIONS,
        width: 33,
    },
    {
        name: "registerId",
        inputType: "number",
        placeholder: "ID do registro",
        width: 33,
    },
];

export default function AuditLogs() {
    const [selectedAudit, setSelectedAudit] = useState<AuditDTO | null>(null);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            return date.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const formatJsonData = (jsonStr: string | null) => {
        if (!jsonStr) return "Nenhum dado registrado";
        try {
            const parsed = JSON.parse(jsonStr);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return jsonStr;
        }
    };

    const getOperationBadge = (operation: 'INSERT' | 'UPDATE' | 'DELETE') => {
        switch (operation) {
            case "INSERT":
                return <StatusBadge variant="success">INSERT</StatusBadge>;
            case "UPDATE":
                return <StatusBadge variant="info">UPDATE</StatusBadge>;
            case "DELETE":
                return <StatusBadge variant="danger">DELETE</StatusBadge>;
            default:
                return <StatusBadge variant="default">{operation}</StatusBadge>;
        }
    };

    const columns: DataTableColumn<AuditDTO>[] = [
        {
            key: "date",
            header: "Data / Hora",
            cell: (row) => <span className="font-mono text-xs">{formatDate(row.date)}</span>,
        },
        {
            key: "tableName",
            header: "Tabela / Entidade",
            cell: (row) => <span className="font-semibold">{normalizeTableName(row.tableName as AuditTables)}</span>,
        },
        {
            key: "registerId",
            header: "ID do Registro",
            cell: (row) => <span className="font-mono text-xs">#{row.registerId}</span>,
        },
        {
            key: "operation",
            header: "Operação",
            cell: (row) => getOperationBadge(row.operation),
        },
        {
            key: "user",
            header: "Usuário Responsável",
            cell: (row) => (
                <div className="flex flex-col text-xs">
                    <span className="font-medium text-foreground">{row.userEmail || "Sistema"}</span>
                    <span className="text-muted-foreground">{row.userRole || "-"}</span>
                </div>
            ),
        },
        {
            key: "actions",
            header: "Detalhes",
            cell: (row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
                    onClick={() => setSelectedAudit(row)}
                >
                    <Eye className="w-4 h-4" />
                    Ver alterações
                </Button>
            ),
        },
    ];

    return (
        <>
            <RegistrationPage<AuditDTO>
                title="Auditoria"
                url="/audit"
                filters={filtersConfig}
                columns={columns}
                rowKey={(row) => row.id}
            />

            <Dialog open={!!selectedAudit} onOpenChange={(open) => !open && setSelectedAudit(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            <DialogTitle>
                                Detalhes da Auditoria #{selectedAudit?.id}
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Registro de {selectedAudit?.operation} na tabela <strong>{selectedAudit?.tableName}</strong> (ID #{selectedAudit?.registerId}) em {selectedAudit && formatDate(selectedAudit.date)} por <strong>{selectedAudit?.userEmail || "Sistema"}</strong>.
                        </DialogDescription>
                    </DialogHeader>
        
                    <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                                    Dados Anteriores (old_data)
                                </span>
                                {selectedAudit?.operation === "INSERT" && (
                                    <span className="text-[10px] text-muted-foreground italic">(Novo registro)</span>
                                )}
                            </div>
                            <pre className="text-xs font-mono bg-background p-3 rounded-lg border border-border overflow-x-auto whitespace-pre-wrap max-h-80">
                                {formatJsonData(selectedAudit?.oldData ?? null)}
                            </pre>
                        </div>
        
                        <div className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                                    Dados Atualizados (new_data)
                                </span>
                                {selectedAudit?.operation === "DELETE" && (
                                    <span className="text-[10px] text-destructive italic">(Registro excluído)</span>
                                )}
                            </div>
                            <pre className="text-xs font-mono bg-background p-3 rounded-lg border border-border overflow-x-auto whitespace-pre-wrap max-h-80">
                                {formatJsonData(selectedAudit?.newData ?? null)}
                            </pre>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
