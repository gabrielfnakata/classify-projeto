import {useFormikContext} from "formik";
import type {AnswerFormValues} from "@/pages/forms/AnswerForm.tsx";
import type {FormQuestionDTO} from "@/shared/dtos/form-questions/FormQuestionDTO.ts";
import {Ghost} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {ContentCard} from "@/components/layout/content-card.tsx";
import QuestionAnswer from "./QuestionAnswer";

interface QuestionListProps {
    questions: FormQuestionDTO[];
}

export default function QuestionList({ questions }: QuestionListProps) {
    const { values, setFieldValue } = useFormikContext<AnswerFormValues>();

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
            {questions.map((question, index) => (
                <ContentCard key={question.uuid} className="flex flex-col w-full gap-8">
                    <div className="flex w-full">
                        <Label
                            className="w-full h-16 border-b-1 px-2 border-table-foreground text-xl font-bold
                            text-foreground placeholder:text-muted-foreground focus:outline-none
                            focus:border-b-2 focus:border-button-background
                            "
                        >
                            {question.question}
                        </Label>
                    </div>
                    <QuestionAnswer
                        type={question.answerType}
                        options={question.options ?? []}
                        value={values.answers[index] ?? { answerText: "", optionUuid: "", optionUuids: [] }}
                        onChange={(value) => setFieldValue(`answers[${index}]`, value)}
                    />
                </ContentCard>
            ))}
        </div>
    );
}
