import type {AnswerType} from "@/shared/models/enums/answer-type.ts";
import type {FormQuestionOptionDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionDTO.ts";

export interface FormQuestionDTO {
    uuid: string,
    formUuid: string,
    question: string,
    answerType: AnswerType,
    options: FormQuestionOptionDTO[]

}
