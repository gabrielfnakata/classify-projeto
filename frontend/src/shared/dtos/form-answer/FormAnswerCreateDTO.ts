import type { AnswerFileCreateDTO } from "./AnswerFileCreateDTO";

export interface FormAnswerCreateDTO {
    questionUuid: string;
    optionUuid?: string;
    answerText?: string;
    answerFiles?: AnswerFileCreateDTO[];
}