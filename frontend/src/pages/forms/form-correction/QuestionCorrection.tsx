import { useFormikContext } from "formik";
import { AnswerType } from "@/shared/models/enums/answer-type.ts";
import type { FormQuestionOptionDTO } from "@/shared/dtos/form-question-options/FormQuestionOptionDTO.ts";
import type { FormAnswerDTO } from "@/shared/dtos/form-answer/FormAnswerDTO.ts";
import { isObjectiveAnswerCorrect } from "@/shared/utils/form-correction-helpers.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import TextareaAutosize from "react-textarea-autosize";
import { Check, X, File } from "lucide-react";
import type {CorrectionFormValues} from "@/pages/forms/FormCorrection.tsx";

interface QuestionCorrectionProps {
    questionUuid: string;
    type: AnswerType;
    options: FormQuestionOptionDTO[];
    answers: FormAnswerDTO[];
}

export default function QuestionCorrection({ questionUuid, type, options, answers }: QuestionCorrectionProps) {
    const { values, handleChange, setFieldValue } = useFormikContext<CorrectionFormValues>();
    const feedback = values.feedbacks[questionUuid] ?? { teacherFeedback: "", correct: false };

    const feedbackField = (
        <TextareaAutosize
            name={`feedbacks.${questionUuid}.teacherFeedback`}
            placeholder="Comentário para o aluno (opcional)"
            value={feedback.teacherFeedback}
            onChange={handleChange}
            minRows={1}
            className="border rounded-lg p-2 resize-none"
        />
    );

    if (type === AnswerType.SELECT || type === AnswerType.MULTI_SELECT) {
        const selectedOptionUuids = new Set(
            answers.map((a) => a.optionUuid).filter((uuid): uuid is string => uuid !== undefined)
        );
        const isCorrect = isObjectiveAnswerCorrect(options, answers);

        const optionsList = options.map((option, i) => {
            const wasSelected = selectedOptionUuids.has(option.uuid);
            const statusColor = option.correct
                ? "text-check"
                : wasSelected
                    ? "text-destructive"
                    : "text-foreground";

            return (
                <div key={i} className="flex items-center gap-2 pl-4">
                    {type === AnswerType.MULTI_SELECT ? (
                        <Checkbox checked={wasSelected} disabled className="bg-white text-black" />
                    ) : (
                        <RadioGroupItem
                            value={option.uuid}
                            checked={wasSelected}
                            disabled
                            className="bg-white text-black"
                        />
                    )}
                    <Label className={`text-md ${statusColor}`}>
                        {option.optionText}
                        {option.correct && <Check className="inline h-4 w-4 ml-2 text-check" />}
                        {wasSelected && !option.correct && <X className="inline h-4 w-4 ml-2 text-destructive" />}
                    </Label>
                </div>
            );
        });

        return (
            <div className="flex flex-col gap-2">
                {type === AnswerType.MULTI_SELECT ? (
                    <div className="flex flex-col gap-2">{optionsList}</div>
                ) : (
                    <RadioGroup value={answers[0]?.optionUuid}>{optionsList}</RadioGroup>
                )}
                <Label className={`mt-2 font-semibold ${isCorrect ? "text-check" : "text-destructive"}`}>
                    {isCorrect ? "Resposta correta" : "Resposta incorreta"}
                </Label>
                {feedbackField}
            </div>
        );
    }

    const correctToggle = (
        <div className="flex items-center gap-2">
            <Label>Resposta correta</Label>
            <Switch
                checked={feedback.correct}
                onCheckedChange={(checked) => setFieldValue(`feedbacks.${questionUuid}.correct`, checked)}
            />
        </div>
    );

    if (type === AnswerType.TEXT) {
        const answer = answers[0];
        return (
            <div className="flex flex-col gap-4">
                <TextareaAutosize
                    value={answer?.answerText ?? ""}
                    disabled
                    className="w-full rounded-lg border border-border bg-white p-4 text-base resize-none"
                />
                {correctToggle}
                {feedbackField}
            </div>
        );
    }

    const files = answers.filter((a) => a.answerFileUrl !== undefined);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 flex-wrap">
                {files.map((file) => (
                    <Card key={file.uuid} className="w-54 p-4 flex flex-col items-center gap-2">
                        <CardHeader className="flex flex-col items-center gap-2">
                            {type === AnswerType.IMAGE ? (
                                <img
                                    src={file.answerFileUrl!}
                                    alt=""
                                    className="h-24 w-24 object-cover rounded"
                                />
                            ) : (
                                <File className="h-8 w-8" />
                            )}
                            <CardTitle className="w-48 break-all text-sm">
                                {file.answerFileUrl && new URL(file.answerFileUrl).pathname.split("/").pop()}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
                {files.length === 0 && (
                    <Label className="text-muted-foreground">
                        {type === AnswerType.IMAGE ? "Nenhuma imagem enviada" : "Nenhum arquivo enviado"}
                    </Label>
                )}
            </div>
            {correctToggle}
            {feedbackField}
        </div>
    );
}
