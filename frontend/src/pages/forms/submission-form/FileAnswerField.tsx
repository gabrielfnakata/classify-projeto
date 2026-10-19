import {useRef, useState} from "react";
import {File as FileIcon, FolderOpen, Image as ImageIcon, Loader2, Plus, X} from "lucide-react";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {Label} from "@/components/ui/label.tsx";
import api from "@/services/api.ts";
import {siloApi} from "@/services/silo.ts";
import {fileSizeFormatter} from "@/shared/utils/file-size-formatter.ts";
import type {FormAnswerFileUploadDTO} from "@/shared/dtos/form-answer-file/FormAnswerFileUploadDTO.ts";
import type {QuestionAnswerValue, UploadedAnswerFile} from "@/shared/models/forms/SubmissionFormState.ts";

const ANSWER_FILES_BUCKET = "form.answers";

const FILE_RULES = {
    [AnswerType.IMAGE]: {
        accept: "image/*",
        isValidType: (file: File) => file.type.startsWith("image/"),
        typeHint: "apenas imagens são aceitas",
        maxSize: 1024 * 1024,
        maxFiles: 5,
        limitLabel: "5 imagens",
        plural: "Imagens",
        emptyTitle: "Nenhuma imagem foi enviada",
        emptyDescription: "Envie uma imagem por aqui",
        action: "Enviar imagem",
        addMore: "Adicionar imagem"
    },
    [AnswerType.FILE]: {
        accept: "application/pdf",
        isValidType: (file: File) =>
            file.type === "application/pdf" || (file.type === "" && file.name.toLowerCase().endsWith(".pdf")),
        typeHint: "apenas arquivos PDF são aceitos",
        maxSize: 5 * 1024 * 1024,
        maxFiles: 2,
        limitLabel: "2 arquivos",
        plural: "Arquivos",
        emptyTitle: "Nenhum arquivo foi enviado",
        emptyDescription: "Envie um arquivo por aqui",
        action: "Enviar arquivo",
        addMore: "Adicionar arquivo"
    },
};

let nextPendingId = 0;

interface FileAnswerFieldProps {
    type: AnswerType.IMAGE | AnswerType.FILE;
    files: UploadedAnswerFile[];
    onChange: (updater: (previous: QuestionAnswerValue) => QuestionAnswerValue) => void;
}

export default function FileAnswerField({type, files, onChange}: FileAnswerFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const rules = FILE_RULES[type];
    const limitReached = files.length >= rules.maxFiles;

    const updateFile = (id: string, changes: Partial<UploadedAnswerFile>) =>
        onChange((previous) => ({
            ...previous,
            files: previous.files.map((file) => file.uuid === id ? {...file, ...changes} : file)
        }));

    const upload = async (file: File, id: string) => {
        try {
            const {data} = await api.post<FormAnswerFileUploadDTO>("/form/upload-url", {
                bucket: ANSWER_FILES_BUCKET,
                fileName: file.name
            });
            await siloApi.put(data.uploadUrl, file, {headers: {"Content-Type": file.type}});
            updateFile(id, {uuid: data.fileUuid, status: "done"});
        } catch {
            updateFile(id, {status: "error", error: "Falha ao enviar o arquivo"});
        }
    };

    const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files ? Array.from(event.target.files) : [];
        event.target.value = "";

        const validType = selected.filter(rules.isValidType);
        const accepted = validType.slice(0, Math.max(rules.maxFiles - files.length, 0));
        const refused = selected.length - validType.length;
        const ignored = validType.length - accepted.length;

        const messages: string[] = [];
        if (refused > 0) {
            messages.push(`${refused === 1 ? "1 arquivo foi recusado" : `${refused} arquivos foram recusados`}: ${rules.typeHint}.`);
        }
        if (ignored > 0) {
            messages.push(`Você pode enviar até ${rules.limitLabel}. ${ignored === 1 ? "1 arquivo foi ignorado" : `${ignored} arquivos foram ignorados`}.`);
        }
        setNotice(messages.length > 0 ? messages.join(" ") : null);

        accepted.forEach((file) => {
            const id = `pending-${nextPendingId++}`;
            const tooLarge = file.size > rules.maxSize;
            const entry: UploadedAnswerFile = {
                uuid: id,
                fileName: file.name,
                size: file.size,
                status: tooLarge ? "error" : "uploading",
                error: tooLarge ? `O tamanho máximo é ${fileSizeFormatter(rules.maxSize)}` : undefined
            };
            onChange((previous) => ({...previous, files: [...previous.files, entry]}));
            if (!tooLarge) upload(file, id);
        });
    };

    const removeFile = (id: string) => {
        setNotice(null);
        onChange((previous) => ({...previous, files: previous.files.filter((file) => file.uuid !== id)}));
    };

    const openSelector = () => inputRef.current?.click();

    return (
        <div className="flex flex-col gap-2">
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={rules.accept}
                onChange={handleSelect}
                className="hidden"
            />
            {files.length === 0 ? (
                <Empty className="border border-dashed bg-muted/30">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderOpen/>
                        </EmptyMedia>
                        <EmptyTitle>{rules.emptyTitle}</EmptyTitle>
                        <EmptyDescription>
                            {rules.emptyDescription} (até {rules.limitLabel}, máximo de {fileSizeFormatter(rules.maxSize)} cada)
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={openSelector}>{rules.action}</Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <Empty className="border border-solid bg-muted/30">
                    <EmptyHeader>
                        <EmptyTitle className="text-xl">{rules.plural} ({files.length}/{rules.maxFiles})</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent className="max-w-none">
                        <div className="flex flex-wrap justify-center w-full gap-8">
                            {files.map((file) => (
                                <div key={file.uuid} className="relative group">
                                    <button
                                        className="
                                        absolute -top-3 -right-3 z-10 p-1 rounded-full bg-muted text-muted-foreground
                                        opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive
                                        hover:text-destructive-foreground hover:cursor-pointer duration-200"
                                        aria-label="Remover"
                                        onClick={() => removeFile(file.uuid)}
                                    >
                                        <X className="h-6 w-6"/>
                                    </button>
                                    <Card className="flex flex-col gap-4 justify-center items-center w-54 h-48 p-4">
                                        <CardHeader className="flex flex-col justify-center items-center gap-2">
                                            <div className="bg-muted rounded-full p-2">
                                                {file.status === "uploading"
                                                    ? <Loader2 className="h-8 w-8 animate-spin"/>
                                                    : type === AnswerType.IMAGE
                                                        ? <ImageIcon className="h-8 w-8"/>
                                                        : <FileIcon className="h-8 w-8"/>}
                                            </div>
                                            <CardTitle className="w-48 break-all">{file.fileName}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {file.status === "error"
                                                ? <Label className="text-destructive">{file.error}</Label>
                                                : <Label>{fileSizeFormatter(file.size)}</Label>}
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                            {!limitReached && (
                                <button
                                    type="button"
                                    onClick={openSelector}
                                    className="
                                    flex flex-col items-center justify-center gap-2 w-54 h-48 rounded-xl border-2
                                    border-dashed border-border text-muted-foreground transition-colors
                                    hover:border-ring hover:text-foreground hover:bg-muted/50 hover:cursor-pointer"
                                >
                                    <Plus className="h-8 w-8"/>
                                    {rules.addMore}
                                </button>
                            )}
                        </div>
                    </EmptyContent>
                </Empty>
            )}
            {notice && <Label className="text-destructive">{notice}</Label>}
        </div>
    );
}
