import type {FormSubmissionAnswerDTO} from "@/shared/dtos/form-submissions/FormSubmissionAnswerDTO.ts";

export interface FormSubmissionCreateDTO {
    answers: FormSubmissionAnswerDTO[]
    formId: string
    studentId?: string
}
