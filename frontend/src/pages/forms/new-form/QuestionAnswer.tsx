import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import type {FormQuestionOptionCreateDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {Check, Delete, FolderOpen, Plus, X} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import {Button} from "@/components/ui/button.tsx";

interface QuestionAnswerProps {
    type: AnswerType;
    options: FormQuestionOptionCreateDTO[];
    onOptionsChange: (options: FormQuestionOptionCreateDTO[]) => void;
}

export default function QuestionAnswer({ type, options, onOptionsChange }: QuestionAnswerProps) {
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
                disabled
            />
        );
    }

    if (type === AnswerType.IMAGE || type === AnswerType.FILE) {
        return (
            <Empty className="border border-dashed bg-muted/30">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FolderOpen/>
                    </EmptyMedia>
                    <EmptyTitle>
                        {type === AnswerType.IMAGE
                            ? 'Nenhuma imagem foi enviada'
                            : 'Nenhum arquivo foi enviado'
                        }
                    </EmptyTitle>
                    <EmptyDescription>
                        {type === AnswerType.IMAGE
                            ? 'As imagens serão enviadas aqui'
                            : 'Os arquivos serão enviados aqui'
                        }
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button disabled>
                        Enviar Arquivos
                    </Button>
                </EmptyContent>
            </Empty>
        );
    }

    const onAddOption = () => {
        const newOption = {
            optionText: "",
            isCorrect: false
        } as FormQuestionOptionCreateDTO;
        onOptionsChange([...options, newOption]);
    };

    const onDeleteOption = (index: number) => {
        onOptionsChange(options.filter((_, i) => i !== index));
    }

    const onMarkCorrect = (index: number) => {
        const updated = options.map((option, i) => {
            if (type === AnswerType.SELECT) {
                return {...option, isCorrect: i === index};
            } else {
                return i === index ? { ...option, isCorrect: !option.isCorrect } : option;
            }
        })
        onOptionsChange(updated);
    }

    const correctIndex = options.findIndex((option) => option.isCorrect);
    const correctValue = correctIndex !== -1 ? `random-question-${correctIndex}` : undefined;

    const renderIndicator = (option: FormQuestionOptionCreateDTO, i: number) => {
        if (type === AnswerType.MULTI_SELECT) {
            return (
                <Checkbox
                    checked={option.isCorrect}
                    className="bg-white text-black"
                    disabled
                />
            );
        }
        return (
            <RadioGroupItem
                value={`random-question-${i}`}
                className="bg-white text-black"
                disabled
            />
        );
    };

    const optionsList = options.map((option, i) => {
        const changeIcon = option.isCorrect && type === AnswerType.MULTI_SELECT;
        const colorClasses = changeIcon
            ? 'text-destructive hover:bg-destructive'
            : 'text-check hover:bg-check';

        return (
            <div key={i} className="flex justify-start items-center gap-2 pl-4">
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
                        disabled={type === AnswerType.SELECT ? option.isCorrect : false}
                    >
                        {changeIcon ? <X /> : <Check />}
                        <TooltipContent>Marcar como {option.isCorrect ? 'incorreta' : 'correta'}</TooltipContent>
                    </TooltipTrigger>
                </Tooltip>
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
                />
            </div>
        )}
    );

    return (
        <>
            {
                type === AnswerType.MULTI_SELECT
                    ? <div className="flex flex-col gap-2">{optionsList}</div>
                    : <RadioGroup value={correctValue}>{optionsList}</RadioGroup>
            }
            <button
                className="flex items-center w-1/2 h-6 p-4 gap-4 rounded-sm text-muted-foreground
                hover:text-black hover:bg-secondary hover:cursor-pointer focus:outline-none focus:outline-2
                focus:outline-solid focus:outline-secondary"
                onClick={() => onAddOption()}
            >
                <Plus/>
                Adicionar Opção
            </button>
        </>
    );
}
