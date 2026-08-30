import {useFormikContext} from "formik";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import type {ReactNode} from "react";
import {Check, CheckCheck, Pencil, Plus} from "lucide-react";
import type {FormQuestionCreateDTO} from "@/shared/dtos/form-questions/FormQuestionCreateDTO.ts";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";

export default function AddQuestion() {
    const { isSubmitting, setFieldValue, values } = useFormikContext<FormCreateDTO>();

    const items: { label: string, value: AnswerType, icon: ReactNode }[] = [
        { label: "Texto", value: AnswerType.TEXT, icon: <Pencil /> },
        { label: "Alternativas", value: AnswerType.SELECT, icon: <Check /> },
        { label: "Múltiplas opções", value: AnswerType.MULTI_SELECT, icon: <CheckCheck /> },
    ];

    const handleAddQuestion = (answerType: AnswerType) => {
        const newQuestion = {
            question: '',
            answerType,
            options: answerType !== AnswerType.TEXT ? [] : undefined
        } as FormQuestionCreateDTO;
        setFieldValue("questions", [...(values.questions ?? []), newQuestion]);
    };

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
                        <DropdownMenuItem className="flex flex-row px-4" onClick={() => handleAddQuestion(item.value)}>
                            {item.icon}
                            {item.label}
                        </DropdownMenuItem>
                    ) }
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
