import {useFormikContext} from "formik";
import type {FormCreateDTO} from "@/shared/dtos/form/FormCreateDTO.ts";
import type {ChangeEvent} from "react";
import type {FormQuestionOptionCreateDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";
import { Ghost } from "lucide-react";
import { Label } from "@/components/ui/label.tsx";
import { ContentCard } from "@/components/layout/content-card.tsx";
import QuestionAnswer from "./QuestionAnswer";
import TextareaAutosize from "react-textarea-autosize";
import QuestionConfigurationOptions from "@/pages/forms/new-form/QuestionConfigurationOptions.tsx";

export default function QuestionList() {
    const { errors, values, setFieldValue } = useFormikContext<FormCreateDTO>();
    const questions = values.questions ?? [];

    const handleQuestionChange = (e: ChangeEvent<HTMLTextAreaElement>, index: number) =>
        setFieldValue(`questions[${index}].question`, e.target.value);

    const handleDuplicateQuestion = (index: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index + 1, 0, questions[index]);
        setFieldValue(`questions`, updatedQuestions);
    }

    const handleDeleteQuestion = (index: number) =>
        setFieldValue("questions", questions.filter((_, i) => i !== index));

    const handleAddOption = (index: number, updatedOptions: FormQuestionOptionCreateDTO[]) =>
        setFieldValue(`questions[${index}].options`, updatedOptions);

    const handleRequiredChange = (index: number, required: boolean) =>
        setFieldValue(`questions[${index}].isRequired`, required);


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
            {questions.map((question, index) => {
                const hasError = errors.questions?.at(index);
                const errorStyle =
                    hasError ? 'outline-1 outline-solid outline-destructive' : 'outline-none';
                return (
                <ContentCard key={index} className={`flex flex-col w-full gap-8 ${errorStyle}`}>
                    <div className="flex w-full justify-between items-center gap-4">
                        <TextareaAutosize
                            placeholder="Insira a questão aqui"
                            className="w-6/10 h-16 px-2 border-table-foreground text-2xl font-bold
                            text-foreground placeholder:text-muted-foreground focus:outline-none resize-none
                            "
                            value={question.question}
                            minRows={1}
                            onChange={(event) => handleQuestionChange(event, index)}
                        />
                        <div className="flex">
                            <QuestionConfigurationOptions
                                required={question.isRequired}
                                handleRequiredChange={(required) => handleRequiredChange(index, required)}
                                handleDuplicateQuestion={() => handleDuplicateQuestion(index)}
                                handleDeleteQuestion={() => handleDeleteQuestion(index)}
                            />
                        </div>
                    </div>
                    <QuestionAnswer
                        type={question.answerType}
                        options={question.options ?? []}
                        onOptionsChange={(updatedOptions) => handleAddOption(index, updatedOptions)}
                    />
                </ContentCard>
            )}
        )}
        </div>
    );
}
