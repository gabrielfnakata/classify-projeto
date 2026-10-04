import {useLayoutEffect, useRef} from "react";
import {useFormikContext} from "formik";
import type {FormQuestionDTO} from "@/shared/dtos/form-questions/FormQuestionDTO.ts";
import {Ghost} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {ContentCard} from "@/components/layout/content-card.tsx";
import QuestionAnswer from "./QuestionAnswer";
import {emptyAnswer, type AnswerFormValues, type QuestionAnswerValue} from "@/shared/models/forms/SubmissionFormState.ts";

interface QuestionListProps {
    questions: FormQuestionDTO[];
}

export default function QuestionList({ questions }: QuestionListProps) {
    const { values, errors, status, setValues } = useFormikContext<AnswerFormValues>();
    const latestValues = useRef(values);

    useLayoutEffect(() => {
        latestValues.current = values;
    }, [values]);

    const updateAnswer = (index: number, updater: (previous: QuestionAnswerValue) => QuestionAnswerValue) => {
        const next = {
            ...latestValues.current,
            answers: latestValues.current.answers.map((answer, i) => i === index ? updater(answer) : answer)
        };
        latestValues.current = next;
        setValues(next);
    };

    const getError = (index: number) => {
        if (!status?.showErrors || !Array.isArray(errors.answers)) return undefined;
        const error = errors.answers[index];
        return typeof error === "string" ? error : undefined;
    };

    if (questions.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center w-full mt-24 gap-8">
                <Ghost className="scale-200 text-foreground opacity-50" />
                <Label className="text-foreground text-center opacity-50">
                    Ainda não há questões neste formulário
                </Label>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 w-8/10">
            {questions.map((question, index) => {
                const error = getError(index);
                const errorStyle = error ? 'outline-1 outline-solid outline-destructive' : 'outline-none';
                return (
                    <ContentCard key={question.uuid} className={`flex flex-col w-full gap-8 ${errorStyle}`}>
                        <div className="flex w-full">
                            <Label className="w-full px-2 text-2xl font-bold text-foreground whitespace-pre-wrap">
                                {question.question}
                                {question.isRequired && <span className="text-destructive">*</span>}
                            </Label>
                        </div>
                        <QuestionAnswer
                            type={question.answerType}
                            options={question.options ?? []}
                            value={values.answers[index] ?? emptyAnswer()}
                            onChange={(updater) => updateAnswer(index, updater)}
                        />
                        {error && <Label className="text-destructive">{error}</Label>}
                    </ContentCard>
                );
            })}
        </div>
    );
}
