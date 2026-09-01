import type {FormAnswerCreateDTO} from "@/shared/dtos/form-answers/FormAnswerCreateDTO.ts";

export interface FormSubmissionCreateDTO {
    answers: FormAnswerCreateDTO[]
    formId: string
    studentId?: string
}
