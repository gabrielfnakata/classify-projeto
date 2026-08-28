import {PageHeader} from "@/components/layout/page-header.tsx";
import {ArrowLeft, Check, CheckCheck, Delete, Pencil, Plus} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {type ChangeEvent, type ReactNode, useEffect, useState} from "react";
import type {FormQuestionCreateDTO} from "@/shared/dtos/form-questions/FormQuestionCreateDTO.ts";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import {ContentCard} from "@/components/layout/content-card.tsx";
import type {FormQuestionOptionCreateDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";

export default function NewForm() {
    const [questions, setQuestions] = useState<FormQuestionCreateDTO[]>([]);
    const navigate = useNavigate();

    const handleAddQuestion = (answerType: AnswerType) => {
        const newQuestion = {
            question: '',
            answerType: answerType,
            options: answerType !== AnswerType.TEXT ? [] : undefined
        } as FormQuestionCreateDTO;
        setQuestions((prev) => [ ...prev, newQuestion ]);
    }

    const handleQuestionChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        setQuestions(prev =>
            prev.map((q, i) => i === index ? { ...q, question: event.target.value } : q)
        );
    }

    const handleAddOption = (index: number, updatedOptions: FormQuestionOptionCreateDTO[]) => {
        setQuestions((prev) =>
            prev.map((q, i) => i === index ? { ...q, options: updatedOptions } : q)
        );
    }

    const handleDeleteQuestion = (index: number) => {
        setQuestions(prev =>
            prev.filter((_, i) => i !== index)
        );
    }

    // DEBUG:
    useEffect(() => { console.log(questions) }, [questions]);

    return (
        <>
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-23 gap-[2vh] justify-start items-center">
                    <div className="flex flex-row w-9/10 items-center justify-between">
                        <PageHeader
                            title={"Novo Formulário"}
                            action={
                            <div className="flex flex-row gap-4">
                                <Button className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold"
                                        onClick={() => navigate('/posted-forms')}>
                                    <ArrowLeft />
                                    Voltar
                                </Button>
                                <AddQuestion
                                    onAddQuestion={handleAddQuestion}
                                />
                            </div>
                            }
                        />
                    </div>
                    <div className="flex flex-col w-9/10 gap-12 mb-8 items-start justify-center">
                        <div className="flex flex-row w-full items-center">
                            <input
                                placeholder="Título do Formulário"
                                className="w-full h-24 border-b-2 px-4 border-table-foreground text-4xl font-bold
                                text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-b-2 focus:border-button-background
                                "
                            />
                        </div>
                        <div className="flex flex-row w-full items-center">
                            <input
                                placeholder="Descrição do formulário"
                                className="w-full h-16 px-4 text-xl text-muted-foreground font-bold text-center
                                text-foreground placeholder:text-muted-foreground focus:outline-none
                                "
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-10 w-8/10">
                        {
                            questions.map((question, index) => {
                                return (
                                    <>
                                        <ContentCard className="flex flex-col w-full gap-8">
                                            <div className="flex w-full">
                                                <input
                                                    placeholder="Insira a questão aqui"
                                                    className="w-full h-16 border-b-1 px-2 border-table-foreground text-xl font-bold
                                                    text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-b-2 focus:border-button-background
                                                    "
                                                    value={question.question}
                                                    onChange={(event) => handleQuestionChange(event, index)}
                                                />
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <button
                                                            className="flex justify-end items-center p-1 ml-4 rounded-sm text-destructive
                                                            hover:bg-destructive hover:text-white hover:transition-colors hover:duration-80
                                                            hover:cursor-pointer"
                                                            onClick={() => handleDeleteQuestion(index)}
                                                        >
                                                        <Delete />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Remover Questão
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <QuestionAnswer
                                                type={question.answerType}
                                                options={question.options ?? []}
                                                onOptionsChange={(updatedOptions) => handleAddOption(index, updatedOptions)}
                                            />
                                        </ContentCard>
                                    </>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

interface AddQuestionProps {
    onAddQuestion: (answerType: AnswerType) => void;
}

function AddQuestion({onAddQuestion}: AddQuestionProps) {
    const items: { label: string, value: AnswerType, icon: ReactNode }[] = [
        { label: "Texto", value: AnswerType.TEXT, icon: <Pencil /> },
        { label: "Alternativas", value: AnswerType.SELECT, icon: <Check /> },
        { label: "Múltiplas opções", value: AnswerType.MULTI_SELECT, icon: <CheckCheck /> },
    ];

    const appearance = (
        <Button className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold"
                onClick={() => {}}>
            <Plus />
            Adicionar Questão
        </Button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                {appearance}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-4">Tipo de Questão</DropdownMenuLabel>
                    { items.map((item) =>
                        <DropdownMenuItem className="flex flex-row px-4" onClick={() => onAddQuestion(item.value)}>
                            {item.icon}
                            {item.label}
                        </DropdownMenuItem>
                    ) }
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface QuestionAnswerProps {
    type: AnswerType;
    options: FormQuestionOptionCreateDTO[];
    onOptionsChange: (options: FormQuestionOptionCreateDTO[]) => void;
}

function QuestionAnswer({ type, options, onOptionsChange }: QuestionAnswerProps) {
    if (type === AnswerType.TEXT) {
        return (
          <Textarea
              placeholder="Aqui vai a resposta..."
              className="border-border h-8 p-4 placeholder:text-muted-foreground"
              disabled
          />
        );
    }

    const onAddOption = () => {
        const newOption = {
            optionText: "",
            isCorrect: false
        } as FormQuestionOptionCreateDTO;
        onOptionsChange([...options, newOption]);
        console.log(options);
    };

    return (
        <>
          <RadioGroup>
              { options.length > 0 ? options.map((option, i) => {
                return (
                    <div className="flex justify-start items-center gap-2 pl-4">
                        <RadioGroupItem
                            value={`random-${option.optionText}`}
                            className="bg-white text-black"
                            disabled
                        />
                        <input
                            value={option.optionText}
                            onChange={(e) => {
                                const updated = options.map((opt, oi) =>
                                    oi === i ? { ...opt, optionText: e.target.value } : opt
                                );
                                onOptionsChange(updated);
                            }}
                            placeholder="A opção vai aqui"
                            className="w-1/2 h-6 pl-4 text-md text-foreground
                            placeholder:text-muted-foreground focus:outline-none"
                        />
                    </div>
                )}
              ) : null
              }
          </RadioGroup>
          <button
            className="flex items-center w-1/2 h-6 p-4 gap-4 rounded-sm text-muted-foreground
                hover:text-white hover:bg-secondary hover:cursor-pointer"
            onClick={() => {onAddOption()}}
          >
            <Plus/>
            Adicionar Opção
          </button>
        </>
    );
}
