import type {FormQuestionDTO} from "@/shared/dtos/form-questions/FormQuestionDTO.ts";
import type {FormAnswerDTO} from "@/shared/dtos/form-answer/FormAnswerDTO.ts";
import type {FormCorrectionCreateDTO} from "@/shared/dtos/form-correction/FormCorrectionCreateDTO.ts";
import {ContentCard} from "@/components/layout/content-card.tsx";
import TextareaAutosize from "react-textarea-autosize";
import QuestionCorrection from "@/pages/forms/form-correction/QuestionCorrection.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Check, X} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {isObjectiveType} from "@/shared/utils/form-correction-helpers.ts";
import {useFormikContext} from "formik";

interface QuestionListProps {
    questions: FormQuestionDTO[];
    answers: Map<string, FormAnswerDTO[]>;
}

export default function QuestionList({ questions, answers }: QuestionListProps) {
    const { setFieldValue, values } = useFormikContext<FormCorrectionCreateDTO>();

    const handleMarkQuestion = (index: number, correct: boolean) =>
        setFieldValue(`formFeedbacks[${index}].correct`, correct);

    return (
        <div className="flex flex-col gap-10 w-8/10">
            {questions.map((question, index) => {
                const objective = isObjectiveType(question.answerType);
                const isCorrect = values.formFeedbacks[index]?.correct ?? false;
                const errorStyle = isCorrect ? "outline-1 outline-solid outline-check/40" : "outline-1 outline-solid outline-destructive/40";

                return (
                    <ContentCard key={question.uuid} className={cn(errorStyle, "flex flex-col w-full gap-8")}>
                        <div className="flex w-full justify-between items-center gap-4">
                            <TextareaAutosize
                                readOnly
                                value={question.question}
                                minRows={1}
                                className="w-6/10 h-16 px-2 border-table-foreground text-2xl font-bold
                                text-foreground focus:outline-none resize-none"
                            />
                            <div className="flex">
                                <Tooltip>
                                    <TooltipTrigger
                                        className="flex justify-end items-center p-1 ml-4 rounded-sm text-destructive
                                        hover:bg-destructive hover:text-white hover:transition-colors hover:duration-80
                                        hover:cursor-pointer focus:outline-none focus:outline-2 focus:outline-solid focus:outline-current
                                        disabled:text-foreground disabled:opacity-50 disabled:pointer-events-none"
                                        onClick={() => handleMarkQuestion(index, false)}
                                        disabled={objective || !isCorrect}
                                    >
                                        <X/>
                                        <TooltipContent>Assinalar como incorreta</TooltipContent>
                                    </TooltipTrigger>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger
                                        className="flex justify-end items-center p-1 rounded-sm text-check
                                        hover:bg-check hover:text-white hover:transition-colors hover:duration-80
                                        hover:cursor-pointer focus:outline-none focus:outline-2 focus:outline-solid focus:outline-current
                                        disabled:text-foreground disabled:opacity-50 disabled:pointer-events-none"
                                        onClick={() => handleMarkQuestion(index, true)}
                                        disabled={objective || isCorrect}
                                    >
                                        <Check/>
                                        <TooltipContent>Assinalar como correta</TooltipContent>
                                    </TooltipTrigger>
                                </Tooltip>
                            </div>
                        </div>
                        <QuestionCorrection
                            index={index}
                            type={question.answerType}
                            options={question.options}
                            answers={answers.get(question.uuid) ?? []}
                        />
                    </ContentCard>
                );
            })}
        </div>
    );
}
