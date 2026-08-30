import {useFormikContext} from "formik";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import type {ChangeEvent} from "react";
import type {FormQuestionOptionCreateDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";
import {Delete, Ghost} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {ContentCard} from "@/components/layout/content-card.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import QuestionAnswer from "./QuestionAnswer";

export default function QuestionList() {
    const { values, setFieldValue } = useFormikContext<FormCreateDTO>();
    const questions = values.questions ?? [];

    const handleQuestionChange = (e: ChangeEvent<HTMLInputElement>, index: number) =>
        setFieldValue(`questions[${index}].question`, e.target.value);

    const handleDeleteQuestion = (index: number) =>
        setFieldValue("questions", questions.filter((_, i) => i !== index));

    const handleAddOption = (index: number, updatedOptions: FormQuestionOptionCreateDTO[]) =>
        setFieldValue(`questions[${index}].options`, updatedOptions);

    if (questions.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center w-full mt-24 gap-8">
                <Ghost className="scale-200 text-foreground opacity-50" />
                <Label className="text-foreground text-center opacity-50">
                    Ainda não há questões no seu formulário
                </Label>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 w-8/10">
            {questions.map((question, index) => (
                <ContentCard key={index} className="flex flex-col w-full gap-8">
                    <div className="flex w-full">
                        <input
                            placeholder="Insira a questão aqui"
                            className="w-full h-16 border-b-1 px-2 border-table-foreground text-xl font-bold
                            text-foreground placeholder:text-muted-foreground focus:outline-none
                            focus:border-b-2 focus:border-button-background
                            "
                            value={question.question}
                            onChange={(event) => handleQuestionChange(event, index)}
                        />
                        <Tooltip>
                            <TooltipTrigger
                                className="flex justify-end items-center h-8 p-1 mt-4 ml-4 rounded-sm text-destructive
                                hover:bg-destructive hover:text-white hover:transition-colors hover:duration-80
                                hover:cursor-pointer focus:outline-none focus:outline-2 focus:outline-solid
                                focus:outline-current
                                "
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
            ))}
        </div>
    );
}
