import type {AnswerFileSubmissionDTO} from "@/shared/dtos/form-submissions/AnswerFileSubmissionDTO.ts";

export interface FormSubmissionAnswerDTO {
    questionUuid: string,
    optionUuid?: string,
    answerText?: string,
    answerFiles?: AnswerFileSubmissionDTO[]
}
