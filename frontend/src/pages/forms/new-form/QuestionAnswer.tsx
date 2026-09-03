import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import type {FormQuestionOptionCreateDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {Check, Delete, File, FolderOpen, Image, Plus, X} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import {Button} from "@/components/ui/button.tsx";
import type {AnswerFileCreateDTO} from "@/shared/dtos/form-answer/AnswerFileCreateDTO.ts";
import {useEffect, useRef, useState} from "react";
import api from "@/services/api.ts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Label} from "@/components/ui/label.tsx";
import {fileSizeFormatter} from "@/shared/utils/file-size-formatter.ts";

interface QuestionAnswerProps {
    type: AnswerType;
    options: FormQuestionOptionCreateDTO[];
    onOptionsChange: (options: FormQuestionOptionCreateDTO[]) => void;
    mode: "configure" | "preview";
}

export default function QuestionAnswer({ type, options, onOptionsChange, mode }: QuestionAnswerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<AnswerFileCreateDTO[]>([]);

    useEffect(() => {
        files.forEach((file) => {
            api.post<string>("/files/upload-url", {file})
                .then((response) => { file.uploadUrl = response.data })
                .catch((error) => console.error(error));
        })
    }, [files]);

    if (type === AnswerType.TEXT) {
        return (
            <TextareaAutosize
                placeholder="Aqui vai a resposta..."
                className="
                flex field-sizing-content min-h-8 w-full rounded-lg border border-border bg-white p-4
                text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring
                focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50
                disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
                md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50
                dark:aria-invalid:ring-destructive/40 border-border h-8 p-4 placeholder:text-muted-foreground
                resize-none
                "
                disabled={mode === "configure"}
            />
        );
    }

    const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        if (selectedFiles.length === 0) return;
        setFiles((prev) => {
            const fileModels = selectedFiles.map((selected) => {return {file: selected, uploadUrl: ''} as AnswerFileCreateDTO});
            return [...prev, ...fileModels];
        });
        e.target.value = "";
    };


    const onRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    if (type === AnswerType.IMAGE || type === AnswerType.FILE) {
        const accept = type === AnswerType.IMAGE ? "image/*" : "application/pdf";
        const triggerFileSelect = () => fileInputRef.current?.click();

        return (
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={accept}
                    onChange={onFilesSelected}
                    className="hidden"
                />
                {files.length === 0
                 ? (
                    <Empty className="border border-dashed bg-muted/30">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <FolderOpen/>
                                </EmptyMedia>
                                <EmptyTitle> {
                                    type === AnswerType.IMAGE
                                    ? 'Nenhuma imagem foi enviada'
                                    : 'Nenhum arquivo foi enviado'
                                }
                                </EmptyTitle>
                                <EmptyDescription> {
                                    type === AnswerType.IMAGE
                                    ? 'Envie uma imagem por aqui'
                                    : 'Envie um arquivo por aqui'
                                }
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={triggerFileSelect}>
                                    Enviar {type === AnswerType.IMAGE ? 'Imagem' : 'Arquivo'}
                                </Button>
                            </EmptyContent>
                        </Empty>
                    )
                    : (
                        <Empty className="border border-solid bg-muted/30">
                            <EmptyHeader>
                                <EmptyTitle className="text-xl">
                                    {type === AnswerType.IMAGE ? "Imagens" : "Arquivos"}
                                </EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                                <div className="flex w-fit h-full gap-8">
                                    {files.map((file, index) => (
                                        <div className="relative group">
                                            <button
                                                className="
                                                absolute -top-3 -right-3 z-10 p-1 rounded-full bg-muted text-muted-foreground
                                                opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive
                                                hover:text-destructive-foreground transition-colors hover:cursor-pointer
                                                duration-200"
                                                aria-label="Close"
                                                onClick={() => onRemoveFile(index)}
                                            >
                                                <X className="h-6 w-6"/>
                                            </button>
                                            <Card
                                                className="
                                                    flex flex-col gap-4 justify-center items-center
                                                    w-54 h-48 p-4 transition-shadow hover:shadow-md
                                                    "
                                            >
                                                <CardHeader className="flex flex-col justify-center items-center gap-2">
                                                    <div className="bg-muted rounded-full p-2">
                                                        { type === AnswerType.IMAGE
                                                        ? <Image className="h-8 w-8"/>
                                                        : <File className="h-8 w-8"/> }
                                                    </div>
                                                    <CardTitle className="w-48 break-all"> {file.file.name} </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <Label>{fileSizeFormatter(file.file.size)}</Label>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </EmptyContent>
                        </Empty>
                    )
                }
            </div>
        );
    }

    const onAddOption = () => {
        const newOption = {
            optionText: "",
            correct: false
        } as FormQuestionOptionCreateDTO;
        onOptionsChange([...options, newOption]);
    };

    const onDeleteOption = (index: number) => {
        onOptionsChange(options.filter((_, i) => i !== index));
    }

    const onMarkCorrect = (index: number) => {
        const updated: FormQuestionOptionCreateDTO[] = options.map((option, i) => {
            return {
                ...option,
                correct: type === AnswerType.SELECT ? i === index : i === index ? !option.correct : false
            }
        });
        onOptionsChange(updated);
    }

    const correctIndex = options.findIndex((option) => option.correct);
    const correctValue = correctIndex !== -1 ? `random-question-${correctIndex}` : undefined;

    const renderIndicator = (option: FormQuestionOptionCreateDTO, i: number) => {
        if (type === AnswerType.MULTI_SELECT) {
            return (
                <Checkbox
                    checked={option.correct}
                    className="bg-white text-black"
                    disabled={mode === "configure"}
                />
            );
        }
        return (
            <RadioGroupItem
                value={`random-question-${i}`}
                className="bg-white text-black"
                disabled={mode === "configure"}
            />
        );
    };

    const optionsList = options.map((option, i) => {
            const changeIcon = option.correct && type === AnswerType.MULTI_SELECT;
            const colorClasses = changeIcon
                ? 'text-destructive hover:bg-destructive'
                : 'text-check hover:bg-check';

            return (
                <div key={i} className="flex justify-start items-center gap-2 pl-4">
                    {mode === "configure" && (
                        <>
                            <Tooltip>
                                <TooltipTrigger
                                    className="flex justify-end items-center p-1 ml-4 rounded-sm text-destructive
                            hover:bg-destructive hover:text-white hover:transition-colors hover:duration-80
                            hover:cursor-pointer rotate-180 focus:outline-none focus:outline-2 focus:outline-solid focus:outline-current"
                                    onClick={() => onDeleteOption(i)}
                                >
                                    <Delete/>
                                    <TooltipContent>Remover Opção</TooltipContent>
                                </TooltipTrigger>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger
                                    className={`flex justify-end items-center p-1 rounded-sm
                                    ${colorClasses} 
                                hover:text-white hover:transition-colors hover:duration-80
                                hover:cursor-pointer focus:outline-none focus:outline-2 focus:outline-solid focus:outline-current
                                disabled:text-foreground disabled:opacity-50 disabled:pointer-events-none`}
                                    onClick={() => onMarkCorrect(i)}
                                    disabled={type === AnswerType.SELECT ? option.correct : false}
                                >
                                    {changeIcon ? <X/> : <Check/>}
                                    <TooltipContent>Marcar como {option.correct ? 'incorreta' : 'correta'}</TooltipContent>
                                </TooltipTrigger>
                            </Tooltip>
                        </>
                    )}
                    {renderIndicator(option, i)}
                    <input
                        value={option.optionText}
                        onChange={(e) => {
                            const updated = options.map((opt, oi) =>
                                oi === i ? {...opt, optionText: e.target.value} : opt
                            );
                            onOptionsChange(updated);
                        }}
                        placeholder="A opção vai aqui"
                        className="w-1/2 h-6 pl-4 text-md text-foreground
                    placeholder:text-muted-foreground focus:outline-none"
                        readOnly={mode === "preview"}
                    />
                </div>
            )
        }
    );

    return (
        <>
            {
                type === AnswerType.MULTI_SELECT
                    ? <div className="flex flex-col gap-2">{optionsList}</div>
                    : <RadioGroup value={correctValue}>{optionsList}</RadioGroup>
            }
            { mode === "configure" && (
                <button
                    className="flex items-center w-1/2 h-6 p-4 gap-4 rounded-sm text-muted-foreground
                    hover:text-black hover:bg-secondary hover:cursor-pointer focus:outline-none focus:outline-2
                    focus:outline-solid focus:outline-secondary"
                    onClick={() => onAddOption()}
                >
                    <Plus/>
                    Adicionar Opção
                </button>
            )}
        </>
    );
}
