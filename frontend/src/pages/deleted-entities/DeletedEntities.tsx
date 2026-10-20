import {DataTable, type DataTableColumn} from "@/components/common/data-table.tsx";
import type { AuditDTO, AuditFilterParams } from "@/shared/dtos/audit/AuditDTO";
import {AuditTables, normalizeTableName, TABLE_NAMES} from "@/shared/models/enums/audit-tables.ts";
import {PageHeader} from "@/components/layout/page-header.tsx";
import {Button} from "@/components/ui/button.tsx";
import {RotateCcw} from "lucide-react";
import {ContentCard} from "@/components/layout/content-card.tsx";
import FilterRow, {type FilterConfig} from "@/components/filter-row/FilterRow.tsx";
import useFetch from "@/hooks/useFetch.tsx";
import {useMemo, useState} from "react";
import {formatDateWithTime, toDate} from "@/shared/utils/date-formatter.ts";
import type {EmployeeDTO} from "@/shared/dtos/employees/EmployeeDTO.ts";
import type {StudentDTO} from "@/shared/dtos/student/StudentDTO.ts";
import type {ClassSessionDTO} from "@/shared/dtos/class-session/ClassSessionDTO.ts";
import UndoDeleteButton from "@/pages/deleted-entities/UndoDeleteButton.tsx";

const emptyFilterValues: AuditFilterParams = {
    startDate: undefined,
    tableName: undefined,
    registerId: undefined
}

export default function DeletedEntities() {
    const filtersConfig: FilterConfig[] = [
        {
            name: "tableName",
            inputType: "select",
            placeholder: "Selecione a tabela",
            options: TABLE_NAMES.filter(table => table.value === 'STUDENT'
                || table.value === 'EMPLOYEE'),
            width: 100,
        },
    ];

    const columns: DataTableColumn<AuditDTO>[] = [
        {
            key: "date",
            header: "Data / Hora",
            cell: (row) => <span className="font-bold">{formatDateWithTime(toDate(row.date))}</span>,
        },
        {
            key: "tableName",
            header: "Tabela / Entidade",
            cell: (row) => <span>{normalizeTableName(row.tableName as AuditTables)}</span>,
        },
        {
            key: "registerData",
            header: "Registro Apagado",
            cell: (row) => <span>{getEntityData(row)}</span>,
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
            key: "action",
            header: "Ações",
            cell: (row) => (
                <UndoDeleteButton row={row} onDone={() => refetch()} />
            )
        }
    ];

    const [appliedFilters, setAppliedFilters] = useState<AuditFilterParams>(emptyFilterValues);

    const fetchFilters = useMemo(
        () => ({ tableName: appliedFilters.tableName, operation: "DELETE" }),
        [appliedFilters.tableName]
    );

    const { data, loading, refetch } = useFetch<AuditDTO[]>(
        'audit',
        undefined,
        undefined,
        fetchFilters
    );

    const logs = useMemo(() => {
        let result = data ?? [];
        if (appliedFilters.registerId) {
            result = result.filter((log) => log.registerId === Number(appliedFilters.registerId));
        }
        return [...result].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [data, appliedFilters.registerId]);

    const getEntityData = (row: AuditDTO) => {
        if (!row.oldData) return "-";

        try {
            const entity = JSON.parse(row.oldData);

            switch (row.tableName) {
                case "STUDENT":
                case "EMPLOYEE":
                    return (entity as StudentDTO | EmployeeDTO).name;
                case "CLASS_SESSION": {
                    const s = entity as ClassSessionDTO;
                    return `Aula - ${s.subjectTeacher.subject} de ${s.startTime}`;
                }
                default:
                    return "-";
            }
        } catch {
            return "-";
        }
    };

    const handleFilterSubmit = (values: Record<string, string>) => {
        setAppliedFilters({
            ...emptyFilterValues,
            tableName: values.tableName || undefined,
            registerId: values.registerId || undefined,
        });
    };

    return (
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-17 gap-[2vh] justify-start items-center">
                    <div className="flex flex-row w-9/10 items-center justify-between">
                        <PageHeader
                            title="Registros Deletados"
                            action={
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2"
                                    onClick={() => refetch()}
                                    disabled={loading ?? false}
                                >
                                    <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}/>
                                    Atualizar
                                </Button>
                            }
                        />
                    </div>

                    <ContentCard className="flex flex-col w-9/10 h-[70vh] p-8 gap-[4vh]">
                        <FilterRow
                            filters={filtersConfig}
                            onSubmit={handleFilterSubmit}
                        />

                        <div className="flex-1 overflow-hidden">
                            <DataTable
                                data={logs}
                                columns={columns}
                                rowKey={(row) => row.id}
                                emptyTitle="Nenhum registro de auditoria encontrado"
                                emptyDescription="As entidades deletadas da aplicação serão registradas e exibidas aqui."
                                onPageChange={() => {}}
                                onSizeChange={() => {}}
                            />
                        </div>
                    </ContentCard>
                </div>
            </div>
    );
}
