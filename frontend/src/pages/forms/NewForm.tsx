import {PageHeader} from "@/components/layout/page-header.tsx";
import {ArrowLeft, Check, CheckCheck, Delete, Eye, Ghost, Pencil, Plus, Send} from "lucide-react";
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
import { type ChangeEvent, type ReactNode, useState } from "react";
import type { FormQuestionCreateDTO } from "@/shared/dtos/form-questions/FormQuestionCreateDTO.ts";
import { AnswerType } from "@/shared/models/enums/answer-type.ts";
import { ContentCard } from "@/components/layout/content-card.tsx";
import type { FormQuestionOptionCreateDTO } from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";
import { Textarea } from "@/components/ui/textarea.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import type { FormCreateDTO } from "@/shared/dtos/form/FormCreateDTO.ts";
import { Formik, type FormikHelpers } from "formik";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {Label} from "@/components/ui/label.tsx";

// TODO: Adicionar algumas validações

export default function NewForm() {
    const [questions, setQuestions] = useState<FormQuestionCreateDTO[]>([]);
    const navigate = useNavigate();

    const initialValues = {
        title: '',
        description: '',
        limitDate: '',
        questions: []
    } as FormCreateDTO;

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

    const handleSubmit = (values: FormCreateDTO, helpers: FormikHelpers<FormCreateDTO>) => {
        helpers.setSubmitting(true);
        const payload = {
            ...values,
            questions
        } as FormCreateDTO;
        console.log(payload);
        // TODO: enviar pra API
        helpers.setSubmitting(false);
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values, formikHelpers) => handleSubmit(values, formikHelpers)}
        >
        {
            ({
                handleChange,
                handleSubmit,
                isSubmitting,
                values
        }) => {
        return (
            <div className="flex flex-col background h-full w-full items-center justify-center">
                <div className="flex flex-col w-full h-full py-23 gap-[2vh] justify-start items-center">
                    <div className="flex flex-row w-9/10 items-center justify-between">

                        <PageHeader
                            title={"Novo Formulário"}
                            action={
                            <div className="flex flex-row gap-4">
                                <Button
                                    className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold
                                    hover:bg-button-highlight hover:cursor-pointer
                                    "
                                    onClick={() => navigate('/posted-forms')}
                                    disabled={isSubmitting}
                                >
                                    <ArrowLeft />
                                    Voltar
                                </Button>
                                <AddQuestion
                                    isSubmitting={isSubmitting}
                                    onAddQuestion={handleAddQuestion}
                                />
                                <Button
                                    className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold
                                            hover:bg-button-highlight hover:cursor-pointer
                                    "
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        alert("Essa funcionalidade ainda está em desenvolvimento.");
                                    }}
                                >
                                    <Eye />
                                    Ver Prévia
                                </Button>
                                <Button
                                    className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold
                                        hover:bg-button-highlight hover:cursor-pointer
                                    "
                                    disabled={questions.length < 1 || isSubmitting}
                                    onClick={() => {
                                        handleSubmit()
                                    }}
                                >
                                    <Send />
                                    Enviar Formulário
                                </Button>
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
                                    name={"title"}
                                    value={values.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-row w-full items-center">
                                <input
                                    placeholder="Descrição do formulário"
                                    className="w-full h-16 px-4 text-xl text-muted-foreground font-bold text-center
                                    text-foreground placeholder:text-muted-foreground focus:outline-none
                                    "
                                    name={"description"}
                                    value={values.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    <div className="flex flex-col gap-10 w-8/10">
                        {
                            questions.length > 0 ? questions.map((question, index) => {
                                return (
                                    <ContentCard key={index} className="flex flex-col w-full gap-8">
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
                                                <TooltipTrigger
                                                    className="flex justify-end items-center h-8 p-1 mt-4 ml-4 rounded-sm text-destructive
                                                    hover:bg-destructive hover:text-white hover:transition-colors hover:duration-80
                                                    hover:cursor-pointer focus:outline-none focus:outline-2 focus:outline-solid focus:outline-current"
                                                    onClick={() => handleDeleteQuestion(index)}
                                                >
                                                    <Delete/>
                                                    <TooltipContent>
                                                        Remover Opção
                                                    </TooltipContent>
                                                </TooltipTrigger>
                                            </Tooltip>
                                        </div>
                                        <QuestionAnswer
                                            type={question.answerType}
                                            options={question.options ?? []}
                                            onOptionsChange={(updatedOptions) => handleAddOption(index, updatedOptions)}
                                        />
                                    </ContentCard>
                                );
                            }) : (
                                <div className="flex flex-col justify-center items-center w-full mt-24 gap-8">
                                    <Ghost className="scale-200 text-foreground opacity-50"/>
                                    <Label className="text-foreground text-center opacity-50">Ainda não há questões no seu formulário</Label>
                                </div>
                                )
                        }
                    </div>
                </div>
            </div>
            );
        }}
    </Formik>
    );
}

interface AddQuestionProps {
    isSubmitting: boolean;
    onAddQuestion: (answerType: AnswerType) => void;
}

function AddQuestion({isSubmitting, onAddQuestion}: AddQuestionProps) {
    const items: { label: string, value: AnswerType, icon: ReactNode }[] = [
        { label: "Texto", value: AnswerType.TEXT, icon: <Pencil /> },
        { label: "Alternativas", value: AnswerType.SELECT, icon: <Check /> },
        { label: "Múltiplas opções", value: AnswerType.MULTI_SELECT, icon: <CheckCheck /> },
    ];

    const appearance = (
        <Button
            className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold
            hover:bg-button-highlight hover:cursor-pointer"
            disabled={isSubmitting}
            onClick={() => {}}
        >
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

    const optionsList = options.map((option, i) => (
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
                    className="flex justify-end items-center p-1 rounded-sm text-check
                    hover:bg-check hover:text-white hover:transition-colors hover:duration-80
                    hover:cursor-pointer focus:outline-none focus:outline-2 focus:outline-solid focus:outline-current"
                    onClick={() => onMarkCorrect(i)}
                >
                    <Check/>
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
    ));

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
