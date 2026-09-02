import {AnswerType} from "@/shared/models/enums/answer-type.ts";
import type {ReactNode} from "react";
import {Check, CheckCheck, File, Image, Pencil} from "lucide-react";
import type {FormQuestionOptionCreateDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";

export interface AnswerTypeOptions {
    label: string,
    value: AnswerType,
    icon: ReactNode
}

export const answerTypeOptions: AnswerTypeOptions[] = [
    { label: "Texto", value: AnswerType.TEXT, icon: <Pencil /> },
    { label: "Alternativas", value: AnswerType.SELECT, icon: <Check /> },
    { label: "Múltiplas opções", value: AnswerType.MULTI_SELECT, icon: <CheckCheck /> },
    { label: "Imagem", value: AnswerType.IMAGE, icon: <Image /> },
    { label: "Documento", value: AnswerType.FILE, icon: <File /> },
];

export const predefinedOptions: FormQuestionOptionCreateDTO[] = [
    { optionText: 'Opção 1', isCorrect: false },
    { optionText: 'Opção 2', isCorrect: true },
    { optionText: 'Opção 3', isCorrect: false },
];
