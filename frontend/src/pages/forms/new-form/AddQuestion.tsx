import {useFormikContext} from "formik";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import {Plus} from "lucide-react";
import type {FormQuestionCreateDTO} from "@/shared/dtos/form-questions/FormQuestionCreateDTO.ts";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {
    answerTypeOptions, predefinedOptions
} from "@/shared/models/constants/answer-type-options"

interface AddQuestionProps {
    buttonVariant: "secondary" | "link" | "default" | "outline" | "ghost" | "destructive" | null | undefined
}

export default function AddQuestion({buttonVariant}: AddQuestionProps) {
    const { isSubmitting, setFieldValue, values } = useFormikContext<FormCreateDTO>();

    const handleAddQuestion = (answerType: AnswerType) => {
        const newQuestion = {
            question: 'Questão',
            answerType,
            options: answerType !== AnswerType.TEXT ? predefinedOptions : undefined
        } as FormQuestionCreateDTO;
        setFieldValue("questions", [...(values.questions ?? []), newQuestion]);
    };

    const appearance = (
        <Button
            variant={buttonVariant}
            className="h-10 px-5 rounded-xl text-sm font-semibold
            hover:cursor-pointer"
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
                    { answerTypeOptions.map((item) =>
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
