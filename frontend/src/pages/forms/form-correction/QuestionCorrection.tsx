import { useFormikContext } from "formik";
import { AnswerType } from "@/shared/models/enums/answer-type.ts";
import type { FormQuestionOptionDTO } from "@/shared/dtos/form-question-options/FormQuestionOptionDTO.ts";
import type { FormAnswerDTO } from "@/shared/dtos/form-answer/FormAnswerDTO.ts";
import type { FormCorrectionCreateDTO } from "@/shared/dtos/form-correction/FormCorrectionCreateDTO.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import TextareaAutosize from "react-textarea-autosize";
import { Check, X, File, FolderOpen, Download, Image as ImageIcon } from "lucide-react";

interface QuestionCorrectionProps {
    index: number;
    type: AnswerType;
    options: FormQuestionOptionDTO[];
    answers: FormAnswerDTO[];
}

const getFileName = (url: string) => {
    try {
        return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "arquivo");
    } catch {
        return "arquivo";
    }
};

const downloadFile = async (url: string, fileName: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Falha ao baixar o arquivo");
        const objectUrl = URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(objectUrl);
    } catch {
        window.open(url, "_blank", "noopener,noreferrer");
    }
};

export default function QuestionCorrection({ index, type, options, answers }: QuestionCorrectionProps) {
    const { values, handleChange } = useFormikContext<FormCorrectionCreateDTO>();
    const feedback = values.formFeedbacks[index];

    const feedbackField = (
        <TextareaAutosize
            name={`formFeedbacks[${index}].teacherFeedback`}
            placeholder="Comentário para o aluno (opcional)"
            value={feedback?.teacherFeedback ?? ""}
            onChange={handleChange}
            minRows={1}
            className="border rounded-lg p-2 resize-none"
        />
    );

    if (type === AnswerType.TEXT) {
        return (
            <div className="flex flex-col gap-4">
                <TextareaAutosize
                    placeholder="Aqui vai a resposta..."
                    className="
                    flex field-sizing-content min-h-8 w-full rounded-lg border border-border bg-white p-4
                    text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring
                    focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50
                    disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
                    md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50
                    dark:aria-invalid:ring-destructive/40 border-border h-8 p-4 placeholder:text-muted-foreground
                    resize-none
                    "
                    value={answers[0]?.answerText ?? ""}
                    disabled
                />
                {feedbackField}
            </div>
        );
    }

    if (type === AnswerType.SELECT || type === AnswerType.MULTI_SELECT) {
        const selectedOptionUuids = new Set(
            answers.map((a) => a.optionUuid).filter((uuid): uuid is string => !!uuid)
        );

        const optionsList = options.map((option) => {
            const wasSelected = selectedOptionUuids.has(option.uuid);
            const statusColor = option.correct
                ? "text-check"
                : wasSelected
                    ? "text-destructive"
                    : "text-foreground";

            return (
                <div key={option.uuid} className="flex items-center gap-2 pl-4">
                    {type === AnswerType.MULTI_SELECT ? (
                        <Checkbox checked={wasSelected} disabled className="bg-white text-black" />
                    ) : (
                        <RadioGroupItem value={option.uuid} disabled className="bg-white text-black" />
                    )}
                    <Label className={`text-md ${statusColor}`}>
                        {option.optionText}
                        {option.correct && <Check className="inline h-4 w-4 ml-2 text-check" />}
                        {wasSelected && !option.correct && (
                            <X className="inline h-4 w-4 ml-2 text-destructive" />
                        )}
                    </Label>
                </div>
            );
        });

        return (
            <div className="flex flex-col gap-2">
                {type === AnswerType.MULTI_SELECT ? (
                    <div className="flex flex-col gap-2">{optionsList}</div>
                ) : (
                    <RadioGroup value={[...selectedOptionUuids][0] ?? ""}>{optionsList}</RadioGroup>
                )}
                {feedbackField}
            </div>
        );
    }

    const files = answers.filter((a) => a.answerFileUrl);

    return (
        <div className="flex flex-col gap-4">
            {files.length === 0 ? (
                <Empty className="border border-dashed bg-muted/30">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderOpen />
                        </EmptyMedia>
                        <EmptyTitle>
                            {type === AnswerType.IMAGE ? "Nenhuma imagem foi enviada" : "Nenhum arquivo foi enviado"}
                        </EmptyTitle>
                    </EmptyHeader>
                </Empty>
            ) : (
                <Empty className="border border-solid bg-muted/30">
                    <EmptyHeader>
                        <EmptyTitle className="text-xl">
                            {type === AnswerType.IMAGE ? "Imagens" : "Arquivos"}
                        </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <div className="flex flex-wrap w-fit h-full gap-8">
                            {files.map((file) => {
                                const url = file.answerFileUrl!;
                                const fileName = getFileName(url);
                                return (
                                    <button
                                        key={file.uuid}
                                        type="button"
                                        onClick={() => downloadFile(url, fileName)}
                                        className="group text-left hover:cursor-pointer focus:outline-none
                                        focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-current rounded-xl"
                                        aria-label={`Baixar ${fileName}`}
                                    >
                                        <Card className="flex flex-col gap-4 justify-center items-center
                                        w-54 h-48 p-4 transition-shadow group-hover:shadow-md">
                                            <CardHeader className="flex flex-col justify-center items-center gap-2">
                                                <div className="bg-muted rounded-full p-2">
                                                    {type === AnswerType.IMAGE
                                                        ? <ImageIcon className="h-8 w-8" />
                                                        : <File className="h-8 w-8" />}
                                                </div>
                                                <CardTitle className="w-48 break-all">{fileName}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex items-center gap-2 text-muted-foreground
                                            group-hover:text-foreground transition-colors">
                                                <Download className="h-4 w-4" />
                                                <Label className="hover:cursor-pointer">Baixar</Label>
                                            </CardContent>
                                        </Card>
                                    </button>
                                );
                            })}
                        </div>
                    </EmptyContent>
                </Empty>
            )}
            {feedbackField}
        </div>
    );
}
