import { useEffect, useState, Fragment } from "react";
import { Plus, Download, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import type { FilterConfig } from "../../filter-row/FilterRow";
import FilterRow from "../../filter-row/FilterRow";
import { DataTable, type DataTableColumn } from "../../common/data-table";
import { useNavigate } from "react-router";
import { Button } from "../../ui/button";
import { ContentCard } from "../../layout/content-card";
import { PageHeader } from "../../layout/page-header";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog";
import api from "@/services/api";

interface registrationPageProps<T> {
    title: string;
    data: T[];
    filters: FilterConfig[];
    columns: DataTableColumn<T>[];
    registrationRoute: string;
    onRefresh?: () => void;
} 

interface dataType {
    uuid: string;
}

interface ImportError {
    row: number;
    reason: string;
}

interface ImportResult {
    created: unknown[];
    errors: ImportError[];
}

export default function RegistrationPage<T extends dataType>({
    title, data, filters, columns, registrationRoute, onRefresh
}: registrationPageProps<T>) {
    const [filterValues, setFilterValues] = useState<Record<string,string>>({});
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [previewRows, setPreviewRows] = useState<Record<string,string>[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const entityPath = registrationRoute.includes('student') ? '/student' : registrationRoute.includes('employee') ? '/employee' : null;
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    const navigate = useNavigate();

    const handleFilterSubmit = (values: Record<string, string>) => {
        setFilterValues(values);
    }

    useEffect(() => {
        // TODO: Chamada à API com a filtragem dos dados
    }, [filterValues]);
    
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    const handleDownloadTemplate = async () => {
        if (!entityPath) return;
        try {
            const response = await api.get(`${entityPath}/template`, { responseType: 'blob' });
            const filename = entityPath.includes('student') ? 'students-template.xlsx' : 'employees-template.xlsx';
            downloadBlob(response.data, filename);
        } catch (e) {
            console.error(e);
            alert('Erro ao baixar template');
        }
    }

    const handleExport = async () => {
        if (!entityPath) return;
        try {
            const response = await api.get(`${entityPath}/export`, { responseType: 'blob', params: filterValues });
            const filename = entityPath.includes('student') ? 'students-export.xlsx' : 'employees-export.xlsx';
            downloadBlob(response.data, filename);
        } catch (e) {
            console.error(e);
            alert('Erro ao exportar');
        }
    }

    const resetImportState = () => {
        setPreviewRows([]);
        setSelectedFile(null);
        setImportResult(null);
    }

    const handleFileSelected = async (file?: File) => {
        const f = file ?? selectedFile;
        if (!f) return;

        setSelectedFile(f);
        setImportResult(null);
        setPreviewLoading(true);
        setImportDialogOpen(true);

        try {
            if (!entityPath) throw new Error('Operação de importação não disponível para este recurso');
            const form = new FormData();
            form.append('file', f);
            const response = await api.post(`${entityPath}/import/preview`, form);
            setPreviewRows(response.data ?? []);
        } catch (e) {
            console.error(e);
            alert('Erro ao gerar pré-visualização. Verifique se o arquivo está no formato esperado (.xlsx).');
            setImportDialogOpen(false);
        } finally {
            setPreviewLoading(false);
        }
    }

    const handleConfirmImport = async () => {
        if (!selectedFile) return;
        setImportLoading(true);
        setImportResult(null);

        try {
        if (!entityPath) throw new Error('Operação de importação não disponível para este recurso');
        const form = new FormData();
        form.append('file', selectedFile);
        const response = await api.post<ImportResult>(`${entityPath}/import`, form);

        const result = response.data;
        setImportResult(result);

        if (!result.errors || result.errors.length === 0) {
            if (onRefresh) {
                onRefresh();
            }
        }
        } catch (e) {
        console.error(e);
        alert('Erro ao importar; verifique o arquivo e tente novamente');
        } finally {
        setImportLoading(false);
        }
    }

    return (
        <>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full gap-[2vh] justify-center items-center">
                    <div className="flex flex-row w-4/5 items-center justify-between">
                    <PageHeader
                        title={`Registro de ${title}`}
                        action={
                            <div className="flex items-center gap-2">
                                        {entityPath ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2">
                                                        <FileText />
                                                        Importar / Exportar
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleDownloadTemplate()}>
                                                        <Download className="mr-2" /> Baixar modelo
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { document.getElementById('file-input')?.click(); }}>
                                                        <Upload className="mr-2"/> Importar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleExport()}>
                                                        <FileText className="mr-2"/> Exportar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : null}

                                        <Button className="h-10 px-5 rounded-xl text-sm font-semibold" onClick={() => navigate(registrationRoute)}>
                                            <Plus></Plus>
                                            Criar novo registro
                                        </Button>
                                    </div>
                                }
                            />
                            </div> 
                    <ContentCard className="flex flex-col w-4/5 h-[64vh] p-8 gap-[4vh]">
                            <FilterRow
                            filters={filters}
                            onSubmit={() => {}}
                            onValuesChange={handleFilterSubmit}
                            />
                            <DataTable
                                data={data}
                                columns={columns}
                                rowKey={(row) => row.uuid}
                            />
                    </ContentCard>
                </div>
            </div>

            {entityPath && (
                <input
                    id="file-input"
                    type="file"
                    accept=".xlsx"
                    style={{display: 'none'}}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelected(f);
                        e.target.value = '';
                    }}
                />
            )}

            <Dialog open={importDialogOpen} onOpenChange={(open) => { if (!open) resetImportState(); setImportDialogOpen(open); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {importResult ? 'Resultado da importação' : 'Pré-visualização de importação'}
                        </DialogTitle>
                        <DialogDescription>
                            {importResult
                                ? 'Confira abaixo os registros importados e as linhas que falharam.'
                                : 'Verifique os registros antes de confirmar a importação. Linhas sem nome serão ignoradas.'}
                        </DialogDescription>
                    </DialogHeader>

                    {importResult && (
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 size={18} />
                                <span className="text-sm font-medium">
                                    {importResult.created.length} registro(s) importado(s) com sucesso
                                </span>
                            </div>

                            {importResult.errors.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <AlertCircle size={18} />
                                        <span className="text-sm font-medium">
                                            {importResult.errors.length} linha(s) com erro
                                        </span>
                                    </div>
                                    <div className="max-h-48 overflow-auto border rounded-md">
                                        <table className="w-full text-sm table-auto border-collapse">
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="border px-2 py-1 text-left">Linha</th>
                                                    <th className="border px-2 py-1 text-left">Motivo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importResult.errors.map((err, idx) => (
                                                    <tr key={idx}>
                                                        <td className="border px-2 py-1">{err.row}</td>
                                                        <td className="border px-2 py-1">{err.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!importResult && (
                        <div className="max-h-64 overflow-auto mt-4">
                            {previewLoading ? (
                                <div>Carregando pré-visualização...</div>
                            ) : previewRows.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Nenhuma linha válida encontrada na planilha.</div>
                            ) : (
                                <table className="w-full text-sm table-auto border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border px-2 py-1">Nome</th>
                                            <th className="border px-2 py-1">Data Nasc</th>
                                            <th className="border px-2 py-1">CPF</th>
                                            {entityPath?.includes('/student') ? (
                                                <>
                                                    <th className="border px-2 py-1">E-mail</th>
                                                    <th className="border px-2 py-1">Data Matr.</th>
                                                </>
                                            ) : entityPath?.includes('/employee') ? (
                                                <>
                                                    <th className="border px-2 py-1">E-mail</th>
                                                    <th className="border px-2 py-1">Cargo</th>
                                                    <th className="border px-2 py-1">Data Admissão</th>
                                                </>
                                            ) : null}
                                            <th className="border px-2 py-1">Telefone1</th>
                                            <th className="border px-2 py-1">Telefone2</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewRows.map((row, idx) => (
                                            <tr key={idx} className="odd:bg-muted">
                                                <td className="border px-2 py-1">{row.name}</td>
                                                <td className="border px-2 py-1">{row.birthDate}</td>
                                                <td className="border px-2 py-1">{row.cpf}</td>
                                                {entityPath?.includes('/student') ? (
                                                    <>
                                                        <td className="border px-2 py-1">{row.email}</td>
                                                        <td className="border px-2 py-1">{row.registrationDate}</td>
                                                    </>
                                                ) : entityPath?.includes('/employee') ? (
                                                    <>
                                                        <td className="border px-2 py-1">{row.email}</td>
                                                        <td className="border px-2 py-1">{row.roleId}</td>
                                                        <td className="border px-2 py-1">{row.hireDate}</td>
                                                    </>
                                                ) : null}
                                                <td className="border px-2 py-1">{row.telephone1}</td>
                                                <td className="border px-2 py-1">{row.telephone2}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <div className="flex w-full justify-end gap-2">
                            {importResult ? (
                                                            <Button onClick={() => { setImportDialogOpen(false); resetImportState(); if (onRefresh) onRefresh(); }}>
                                    Fechar e atualizar listagem
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={() => { setImportDialogOpen(false); resetImportState(); }}>Cancelar</Button>
                                    <Button onClick={handleConfirmImport} disabled={importLoading || !selectedFile || previewRows.length === 0}>
                                        {importLoading ? 'Importando...' : 'Confirmar importação'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};