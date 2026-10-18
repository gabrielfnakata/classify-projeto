import type {FormQuestionOptionCreateDTO} from "@/shared/dtos/form-question-options/FormQuestionOptionCreateDTO.ts";
import type {AnswerType} from "@/shared/models/enums/answer-type.ts";

export interface FormQuestionCreateDTO {
    question: string,
    answerType: AnswerType,
    isRequired: boolean,
    options?: FormQuestionOptionCreateDTO[]
}
